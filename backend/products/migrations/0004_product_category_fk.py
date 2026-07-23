import django.db.models.deletion
from django.db import migrations, models
 
 
LEGACY_CATEGORIES = {
    'collections': 'Collections',
    'casual': 'Casual Wear',
    'party': 'Party Wear',
    'office': 'Office Wear',
    'aesthetic': 'Aesthetic',
}
 
 
def populate_category_fk(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    Category = apps.get_model('products', 'Category')
 
    # Make sure a real Category row exists for every legacy value products
    # were using, so no product loses its category during the conversion.
    for slug, name in LEGACY_CATEGORIES.items():
        Category.objects.get_or_create(
            slug=slug, defaults={'name': name, 'is_active': True, 'description': ''}
        )
 
    for product in Product.objects.all():
        old_value = product.category
        if not old_value:
            continue
        category, _ = Category.objects.get_or_create(
            slug=old_value,
            defaults={'name': old_value.replace('-', ' ').title(), 'is_active': True, 'description': ''},
        )
        product.category_new = category
        product.save(update_fields=['category_new'])
 
 
def reverse_populate_category_fk(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    for product in Product.objects.all():
        category = product.category_new
        product.category = category.slug if category else 'collections'
        product.save(update_fields=['category'])
 
 
class Migration(migrations.Migration):
 
    dependencies = [
        ('products', '0003_category_slug'),
    ]
 
    operations = [
        # Migration history says Category has a `created_at` column, but the
        # real database table never had one (same kind of drift as `slug`,
        # just in reverse). Fix the STATE only so the RunPython step below
        # doesn't try to SELECT a column that doesn't exist.
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RemoveField(model_name='category', name='created_at'),
            ],
            database_operations=[],
        ),
        # Step 1: add the new FK alongside the old CharField.
        migrations.AddField(
            model_name='product',
            name='category_new',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='products_tmp',
                to='products.category',
            ),
        ),
        # Step 2: copy data across, creating Category rows for legacy values.
        migrations.RunPython(populate_category_fk, reverse_populate_category_fk),
        # Step 3: drop the old field and put the new one in its place.
        migrations.RemoveField(
            model_name='product',
            name='category',
        ),
        migrations.RenameField(
            model_name='product',
            old_name='category_new',
            new_name='category',
        ),
        migrations.AlterField(
            model_name='product',
            name='category',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='products',
                to='products.category',
            ),
        ),
    ]