# events/management/commands/get_token.py

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


class Command(BaseCommand):
    help = 'Get or create authentication token for a user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to get token for')

    def handle(self, *args, **options):
        username = options['username']
        
        try:
            user = User.objects.get(username=username)
            token, created = Token.objects.get_or_create(user=user)
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'\n✓ Created new token for {username}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'\n✓ Retrieved existing token for {username}'))
            
            self.stdout.write(self.style.SUCCESS(f'\n📝 Token: {token.key}'))
            self.stdout.write(self.style.SUCCESS(f'   User: {user.username}'))
            self.stdout.write(self.style.SUCCESS(f'   Email: {user.email}'))
            self.stdout.write(self.style.SUCCESS('\nUse in Postman:'))
            self.stdout.write(self.style.SUCCESS('Authorization: Token ' + token.key + '\n'))
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'\n✗ User "{username}" does not exist'))
            self.stdout.write(self.style.WARNING('\nAvailable users:'))
            for user in User.objects.all()[:10]:
                self.stdout.write(f'  - {user.username}')