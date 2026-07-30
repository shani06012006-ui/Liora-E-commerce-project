from django.db import migrations, models
 
 
class Migration(migrations.Migration):
    dependencies = [
        ("products", "0002_product_cost_price"),
    ]
 
    operations = [
        migrations.AddField(
            model_name="category",
            name="slug",
            field=models.SlugField(unique=True),
        ),
    ]