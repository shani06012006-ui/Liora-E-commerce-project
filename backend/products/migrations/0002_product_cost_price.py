from django.db import migrations, models
 
 
class Migration(migrations.Migration):
 
    dependencies = [
        ('products', '0001_initial'),
    ]
 
    operations = [
        migrations.AddField(
            model_name='product',
            name='cost_price',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text='What this product actually costs you. Used to calculate real profit in Analytics. Leave blank if unknown.',
                max_digits=10,
                null=True,
            ),
        ),
    ]
 