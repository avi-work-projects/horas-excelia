"""Optional archive notification only; never fail invoice emission for Drive."""
import ast


def patch(source):
    old='        tmp=path.with_suffix(\'.pending\');tmp.write_bytes(pdf);os.replace(tmp,path)'
    new=old+'''
        # Independent publisher; failures never reissue or resend an invoice.
        try:(Path(root).parent/'drive-publish-request').touch()
        except OSError:pass  # Boot-time publisher scan also reconciles archives.
'''.rstrip()
    if source.count(old)!=1:raise ValueError('Archive helper changed; review first')
    result=source.replace(old,new);ast.parse(result);return result
