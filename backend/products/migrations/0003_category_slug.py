from django.db import migrations, models
 
 
class Migration(migrations.Migration):
 
    dependencies = [
        ('products', '0002_product_cost_price'),
    ]
 
    operations = [
        # The `slug` column already physically exists on products_category in
        # the database (it was added outside of Django's migration history).
        # We only need Django's migration STATE to know about it — issuing
        # an actual ADD COLUMN would fail with "column already exists", which
        # is exactly the error we hit. SeparateDatabaseAndState with an empty
        # database_operations list updates the state only, with no real SQL.
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='category',
                    name='slug',
                    field=models.SlugField(unique=True),
                ),
            ],
            database_operations=[],
        ),
    ]
 