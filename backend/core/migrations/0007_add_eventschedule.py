from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_alter_volunteerevent_availability_time_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='EventSchedule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('event', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='schedules',
                    to='core.event'
                )),
            ],
            options={
                'ordering': ['date'],
            },
        ),
    ]
