from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_volunteer_user'),  
    ]

    operations = [
        migrations.RenameField(
            model_name='eventschedule',
            old_name='time_start',
            new_name='start_time',
        ),
        migrations.RenameField(
            model_name='eventschedule',
            old_name='time_end',
            new_name='end_time',
        ),
    ]
