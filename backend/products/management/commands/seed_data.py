from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Does nothing (disabled)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("seed_data is disabled. Skipping."))
