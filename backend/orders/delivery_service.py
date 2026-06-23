import requests
import json
from django.conf import settings

class ShiprocketQuickService:
    """
    Integration for Shiprocket Quick (Hyper-Local Delivery Aggregator)
    Connects with Dunzo, Shadowfax, Borzo, Porter automatically.
    """
    BASE_URL = "https://apiv2.shiprocket.in/v1/external"

    def __init__(self):
        self.api_key = getattr(settings, 'SHIPROCKET_API_KEY', None)
        self.token = None

    def authenticate(self):
        """Mock authentication to Shiprocket API"""
        # In production, call /auth/login with email/password to get JWT token
        self.token = "mock_jwt_token_for_shiprocket"
        return self.token

    def create_hyperlocal_order(self, order_obj, pickup_shop, customer_user):
        """
        Pings Shiprocket Quick to assign the closest delivery rider.
        """
        if not self.api_key:
            # Fallback for dev mode without API keys
            return {
                "status": "success",
                "tracking_id": f"TRK-{order_obj.order_id}",
                "tracking_url": f"https://mock-tracking.indianlocalstore.com/{order_obj.order_id}",
                "courier_name": "Mock Shadowfax"
            }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.authenticate()}"
        }

        # Structure based on Shiprocket Quick API docs
        payload = {
            "order_id": order_obj.order_id,
            "order_date": order_obj.created_at.strftime("%Y-%m-%d %H:%M"),
            "pickup_location": pickup_shop.name,
            "billing_customer_name": customer_user.username,
            "billing_last_name": "",
            "billing_address": order_obj.delivery_address,
            "billing_city": order_obj.delivery_city,
            "billing_pincode": order_obj.delivery_pincode,
            "billing_state": order_obj.delivery_state,
            "billing_country": "India",
            "billing_email": customer_user.email,
            "billing_phone": customer_user.phone_number if hasattr(customer_user, 'phone_number') else "9999999999",
            "shipping_is_billing": True,
            "order_items": [
                {
                    "name": item.product.name,
                    "sku": str(item.product.id),
                    "units": item.quantity,
                    "selling_price": float(item.price),
                } for item in order_obj.items.all()
            ],
            "payment_method": "Prepaid" if order_obj.payment_status == 'completed' else "COD",
            "sub_total": float(order_obj.final_amount),
            "length": 10,
            "breadth": 10,
            "height": 10,
            "weight": 0.5
        }

        # Mock API Call
        # response = requests.post(f"{self.BASE_URL}/orders/create/adhoc", headers=headers, json=payload)
        # data = response.json()
        
        # Returning mock data for now
        return {
            "status": "success",
            "tracking_id": f"TRK-{order_obj.order_id}",
            "tracking_url": f"https://mock-tracking.indianlocalstore.com/{order_obj.order_id}",
            "courier_name": "Borzo"
        }

delivery_service = ShiprocketQuickService()
