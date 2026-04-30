from django.db import connection

c = connection.cursor()
tables_in_order = [
    'orders_orderitem',
    'orders_payment',
    'orders_order',
    'orders_cartitem',
    'orders_cart',
    'products_productreview',
    'products_productimage',
    'products_product',
    'shops_shopreview',
    'shops_shopservice',
    'shops_shop',
]
for t in tables_in_order:
    try:
        c.execute(f'DELETE FROM {t}')
        print(f'Cleared: {t}')
    except Exception as e:
        print(f'Skip {t}: {e}')
        connection.rollback()

c.execute("DELETE FROM users_user WHERE is_superuser = false")
print('Cleared all non-admin users')

# Reset sequences
for seq in ['users_user_id_seq', 'shops_shop_id_seq', 'products_product_id_seq',
            'orders_order_id_seq', 'orders_cart_id_seq', 'orders_cartitem_id_seq']:
    try:
        c.execute(f'ALTER SEQUENCE {seq} RESTART WITH 1')
        print(f'Reset: {seq}')
    except Exception as e:
        print(f'Skip seq {seq}: {e}')
        connection.rollback()

print('Done.')
