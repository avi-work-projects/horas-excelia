"""Add the prerequisite guard inside the invoice service's existing write lock."""
from prepare_multi_invoice import function, replace


def patch(source):
    def approve(body):
        guard = " cfg=config()\n from invoice_prerequisites import require\n require(ROOT,p['period'],cfg)\n"
        return replace(body, " cfg=config()\n", guard)
    return function(source, 'approve', approve)
