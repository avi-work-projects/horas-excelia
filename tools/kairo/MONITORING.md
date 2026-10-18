# Independent monitoring

`monitoring.py` observes the private invoice database through SQLite `mode=ro`.
It never imports the invoice runner, fiscal adapter or SMTP code. It has its own
lock and timer; a monitoring outage cannot block invoice delivery.

## Setup (not complete until the real account is linked and tested)

Create a dedicated Healthchecks project, connect Telegram and enter its read/write
API key in the authenticated `/facturas/monitor` page. The key remains in a 0600
private `monitor-config.json`, excluded from Git. Only Telegram channels are used.
No invoice PDFs, recipient addresses, amounts, certificate or SMTP secrets leave
Kairo. Check names, schedule, timestamps and the source IP are visible externally.

The integration upserts two named checks:
- Availability: 300 second period + 300 second grace; checks web service and runner
  timer active. It does not certify every dependency of the invoice stack.
- Delivery: exact approved send date at 08:00 Europe/Madrid, 300 second grace.
  The initial pre-deadline ping arms the remote calendar. Later success requires
  both `plans.status=sent` and its matching durable `mails.state=sent` row.
  SMTP acceptance is not recipient delivery or reading confirmation.

The external calendar must be inspected after setup. In particular verify its next
expected execution and timezone, then demonstrate an absent signal and a failure
on a separate synthetic check. Never test by running `service.py tick`, changing
the invoice plan or stopping the production invoice timer. Keep an external test
check paused after the experiment; remove it only under applicable deletion rules.

## Temporary maintenance

The UI offers 1/4/24 hours and early resume. It extends ONLY availability's external
timeout and sends one signal, then suppresses availability pings locally until the
deadline. The remote deadline still expires if the machine stays off. There is a
five minute grace period. The monthly delivery check remains armed independently.
Do not shut down until the page confirms the remote update. This is not a shutdown
button or cancellation of invoices. The plan and scheduler are unchanged.

## Private web integration

Use the existing authenticated GET `/facturas/monitor` to render `page(CSRF)`.
After the existing POST authentication, Origin, CSRF and JSON length checks,
dispatch this path to `action(data)` OUTSIDE the invoice process lock. Add an Avisos
link in the review navigation. Do not publish the private service or its data.

Run `python3 test_monitoring.py` on Linux. Six tests use synthetic data and mock
network calls. Live deployment additionally checked anonymous GET and CSRF rejection,
and exact equality of invoice plans and mail attempts before and after installation.

Status 2026-10-18: installed, account/Telegram link and real notification tests pending.
Without monitor-config.json the timer exits `not_configured` and makes no requests.
