"""The runner emits at 07:30 and sends at 08:00 in Madrid."""
from datetime import datetime
from zoneinfo import ZoneInfo


def can_cancel(state, send_date, moment=None):
    deadline={'approved':'07:30','accepted':'08:00'}.get(state)
    if not deadline:
        return False
    madrid=ZoneInfo('Europe/Madrid')
    now=moment.astimezone(madrid) if moment else datetime.now(madrid)
    return now.strftime('%Y-%m-%dT%H:%M') < send_date+'T'+deadline
