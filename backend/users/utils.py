import requests
import json

def send_push_notification(expo_push_token, title, body, data=None):
    if not expo_push_token:
        return False
        
    message = {
        'to': expo_push_token,
        'sound': 'default',
        'title': title,
        'body': body,
        'data': data or {},
    }
    
    try:
        response = requests.post(
            'https://exp.host/--/api/v2/push/send',
            headers={
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            data=json.dumps(message)
        )
        return response.status_code == 200
    except Exception as e:
        print(f"Error sending push notification: {str(e)}")
        return False
