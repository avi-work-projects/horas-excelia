# No request data, certificate secrets or remote response content in errors.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$stage = 'input'
$certificate = $null
$store = $null
try {
    $rawRequest = [Console]::In.ReadToEnd()
    if ($rawRequest.Length -gt 12000000) { throw 'Input too large' }
    $request = $rawRequest | ConvertFrom-Json
    if ($request.action -notin @('certificate','request')) { throw 'Invalid action' }

    if ($request.action -eq 'request') {
        $stage = 'request_validation'
        if ($request.url -isnot [string] -or $request.url.Length -gt 2048 -or $request.url -match '[\x00-\x20\x7f\\]') { throw 'Invalid URL' }
        $uri = [Uri]$request.url
        $hosts = @('www1.agenciatributaria.gob.es','www2.agenciatributaria.gob.es','prewww1.aeat.es','prewww2.aeat.es')
        if (-not $uri.IsAbsoluteUri -or $uri.Scheme -ne 'https' -or $uri.DnsSafeHost -notin $hosts -or $uri.Port -ne 443 -or $uri.UserInfo -or $uri.Fragment) { throw 'Destination not allowed' }
        if ($request.method -notin @('GET','POST') -or $request.client_certificate -isnot [bool]) { throw 'Invalid request' }
        if (($request.timeout -isnot [int] -and $request.timeout -isnot [long] -and $request.timeout -isnot [double]) -or [double]::IsNaN($request.timeout) -or [double]::IsInfinity($request.timeout) -or $request.timeout -lt 1 -or $request.timeout -gt 120) { throw 'Invalid timeout' }
        if (($request.max_bytes -isnot [int] -and $request.max_bytes -isnot [long]) -or $request.max_bytes -lt 1 -or $request.max_bytes -gt 33554432) { throw 'Invalid response limit' }
        if ($request.headers -isnot [PSCustomObject] -or @($request.headers.PSObject.Properties).Count -gt 4) { throw 'Invalid headers' }
        foreach ($property in $request.headers.PSObject.Properties) {
            if ($property.Name -notin @('Content-Type','Accept','Accept-Encoding','User-Agent') -or $property.Value -isnot [string] -or -not $property.Value -or $property.Value.Length -gt 512 -or $property.Value -match '[\x00-\x1f\x7f]') { throw 'Header not allowed' }
            if ($property.Name -eq 'Accept-Encoding' -and $property.Value -cne 'identity') { throw 'Encoding not allowed' }
            if ($property.Name -eq 'Content-Type' -and $null -eq $request.body) { throw 'Content required' }
        }
        $content = $null
        if ($null -ne $request.body) {
            if ($request.method -eq 'GET' -or $request.body -isnot [string] -or $request.body.Length -gt 11184812) { throw 'Invalid body' }
            $content = [Convert]::FromBase64String($request.body)
            if ($content.Length -gt 8388608) { throw 'Body too large' }
        }
    }

    if ($request.action -eq 'certificate' -or $request.client_certificate) {
        $stage = 'certificate'
        if ($request.thumbprint -isnot [string] -or $request.thumbprint -notmatch '^[A-Fa-f0-9]{40}$') { throw 'Invalid fingerprint' }
        # Windows PowerShell may not load Cert:. The native store needs no provider.
        $store = New-Object System.Security.Cryptography.X509Certificates.X509Store('My','CurrentUser')
        $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadOnly -bor [System.Security.Cryptography.X509Certificates.OpenFlags]::OpenExistingOnly)
        $matches = $store.Certificates.Find([System.Security.Cryptography.X509Certificates.X509FindType]::FindByThumbprint,[string]$request.thumbprint,$false)
        if ($matches.Count -ne 1) { throw 'Certificate not found uniquely' }
        $certificate = $matches[0]
        if (-not $certificate.HasPrivateKey -or $certificate.NotBefore.ToUniversalTime() -gt [DateTime]::UtcNow -or $certificate.NotAfter.ToUniversalTime() -le [DateTime]::UtcNow) { throw 'Certificate unavailable or expired' }
    }

    if ($request.action -eq 'certificate') {
        $stage = 'certificate_metadata'
        $sha = [Security.Cryptography.SHA256]::Create()
        try { $fingerprint = [BitConverter]::ToString($sha.ComputeHash($certificate.RawData)).Replace('-','').ToLowerInvariant() }
        finally { $sha.Dispose() }
        $output = @{ok=$true;certificate=@{sha256=$fingerprint;subject=$certificate.Subject;
            not_after=$certificate.NotAfter.ToUniversalTime().ToString('o');has_private_key=$true}}
    } else {
        $stage = 'http_setup'
        Add-Type -AssemblyName System.Net.Http
        $handler = New-Object System.Net.Http.HttpClientHandler
        $handler.AllowAutoRedirect = $false
        $handler.UseCookies = $false
        $handler.CheckCertificateRevocationList = $true
        $handler.AutomaticDecompression = [System.Net.DecompressionMethods]::None
        $handler.MaxResponseHeadersLength = 64
        $handler.SslProtocols = [System.Security.Authentication.SslProtocols]::Tls12
        $handler.ClientCertificateOptions = [System.Net.Http.ClientCertificateOption]::Manual
        if ($certificate) { [void]$handler.ClientCertificates.Add($certificate) }
        $http = New-Object System.Net.Http.HttpClient($handler)
        $http.Timeout = [TimeSpan]::FromSeconds([double]$request.timeout)
        $cancel = New-Object System.Threading.CancellationTokenSource
        $cancel.CancelAfter([TimeSpan]::FromSeconds([double]$request.timeout))
        $message = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::new($request.method),$uri)
        $response = $null
        $stream = $null
        $memory = New-Object System.IO.MemoryStream
        try {
            if ($null -ne $content) { $message.Content = New-Object System.Net.Http.ByteArrayContent(,$content) }
            foreach ($property in $request.headers.PSObject.Properties) {
                if ($property.Name -eq 'Content-Type') {
                    if (-not $message.Content.Headers.TryAddWithoutValidation($property.Name,[string]$property.Value)) { throw 'Header rejected' }
                } elseif (-not $message.Headers.TryAddWithoutValidation($property.Name,[string]$property.Value)) { throw 'Header rejected' }
            }
            $stage = 'http_send'
            $response = $http.SendAsync($message,[System.Net.Http.HttpCompletionOption]::ResponseHeadersRead,$cancel.Token).GetAwaiter().GetResult()
            $stage = 'http_response'
            $status = [int]$response.StatusCode
            if ($status -ge 300 -and $status -le 399) { throw 'Redirect rejected' }
            if ($null -ne $response.Content.Headers.ContentLength -and $response.Content.Headers.ContentLength -gt $request.max_bytes) { throw 'Response too large' }
            if (@($response.Content.Headers.ContentEncoding | Where-Object { $_ -cne 'identity' }).Count -gt 0) { throw 'Encoding rejected' }
            $stream = $response.Content.ReadAsStreamAsync().GetAwaiter().GetResult()
            $buffer = New-Object byte[] 65536
            while (($count = $stream.ReadAsync($buffer,0,$buffer.Length,$cancel.Token).GetAwaiter().GetResult()) -gt 0) {
                if (($memory.Length + $count) -gt [int]$request.max_bytes) { throw 'Response too large' }
                $memory.Write($buffer,0,$count)
            }
            $headers = @{}
            foreach ($header in $response.Headers) { $headers[$header.Key.ToLowerInvariant()] = [string]::Join(',',$header.Value) }
            foreach ($header in $response.Content.Headers) { $headers[$header.Key.ToLowerInvariant()] = [string]::Join(',',$header.Value) }
            $output = @{ok=$true;status=$status;headers=$headers;body=[Convert]::ToBase64String($memory.ToArray())}
        } finally {
            if ($stream) { $stream.Dispose() }
            if ($response) { $response.Dispose() }
            $memory.Dispose(); $message.Dispose(); $cancel.Dispose(); $http.Dispose(); $handler.Dispose()
        }
    }
    $output | ConvertTo-Json -Depth 7 -Compress
} catch {
    # Only fixed diagnostic metadata, never exception messages or request data.
    @{ok=$false;stage=$stage;error_type=$_.Exception.GetType().Name;line=$_.InvocationInfo.ScriptLineNumber} | ConvertTo-Json -Compress
    exit 1
} finally {
    if ($certificate) { $certificate.Dispose() }
    if ($store) { $store.Close() }
}
