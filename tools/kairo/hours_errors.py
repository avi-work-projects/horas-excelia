"""Public failure codes. Never serialize browser exceptions or mailbox contents."""
MESSAGES = {
    'auth_required': 'Outlook necesita iniciar sesión. Pulsa «Comprobar acceso».',
    'browser_unavailable': 'El navegador de Outlook no está disponible en Kairo.',
    'compose_open': 'Hay un correo abierto para editar en Outlook. Ciérralo antes de comprobar.',
    'wrong_account': 'La cuenta abierta en Outlook no es la configurada para las horas.',
    'read_failed': 'No se pudo completar la lectura de Outlook. Se conserva la última comprobación correcta.',
}


class HoursFailure(RuntimeError):
    def __init__(self, code):
        self.code = code if code in MESSAGES else 'read_failed'
        super().__init__(MESSAGES[self.code])
