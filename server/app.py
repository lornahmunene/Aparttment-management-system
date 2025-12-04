from flask import Flask, request, make_response, jsonify
from flask_migrate import Migrate
from flask_restful import Api, Resource
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import datetime

from models import db, User, Room, Tenant, Payment 

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///apartments.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

# --- JWT Configuration ---
app.config["JWT_SECRET_KEY"] = "super-secret-key-replace-me-in-production"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=24)
jwt = JWTManager(app)

migrate = Migrate(app, db)
db.init_app(app)

api = Api(app)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"]}}, supports_credentials=True)

# ------------------ HOME ---------------------- #
class Home(Resource):
    def get(self):
        return make_response({"message": "Welcome to the Apartment Management API"}, 200)

# ------------------ AUTHENTICATION ---------------------- #
class UserLogin(Resource):
    def post(self):
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            # FIX: Convert user.id to string for JWT
            access_token = create_access_token(identity=str(user.id))
            
            return make_response({
                "message": "Login successful",
                "access_token": access_token,
                "user": user.to_dict()
            }, 200)
        
        return make_response({"message": "Invalid email or password"}, 401)

# ------------------ ROOMS CRUD ---------------------- #
class Rooms(Resource):
    @jwt_required()
    def get(self):
        try:
            rooms = Room.query.all()
            data = [{
                "id": r.id,
                "room_number": r.room_id,
                "room_type": r.type,
                "rent_amount": r.rent_amount,
                "status": r.status,
                "tenant_id": r.tenant_id
            } for r in rooms]
            return make_response(data, 200)
        except Exception as e:
            return make_response({"error": str(e)}, 500)

    @jwt_required()
    def post(self):
        try:
            data = request.get_json()
            
            if not all(k in data for k in ("room_number", "room_type", "rent_amount")):
                return make_response({"error": "Missing required fields"}, 400)
            
            existing_room = Room.query.filter_by(room_id=data["room_number"]).first()
            if existing_room:
                return make_response({"error": "Room number already exists"}, 400)
                
            new_room = Room(
                room_id=data["room_number"],
                type=data["room_type"],
                rent_amount=data["rent_amount"],
                status=data.get("status", "vacant")
            )
            
            db.session.add(new_room)
            db.session.commit()
            
            return make_response({
                "id": new_room.id,
                "room_number": new_room.room_id,
                "room_type": new_room.type,
                "rent_amount": new_room.rent_amount,
                "status": new_room.status,
                "tenant_id": new_room.tenant_id
            }, 201)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 500)


class RoomById(Resource):
    @jwt_required()
    def put(self, id):
        try:
            room = Room.query.get_or_404(id)
            data = request.get_json()

            if "tenant_id" in data:
                room.tenant_id = data["tenant_id"]
            if "status" in data:
                room.status = data["status"]

            db.session.commit()
            
            return make_response({
                "id": room.id,
                "room_number": room.room_id,
                "room_type": room.type,
                "rent_amount": room.rent_amount,
                "status": room.status,
                "tenant_id": room.tenant_id
            }, 200)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 500)

    @jwt_required()
    def delete(self, id):
        try:
            room = Room.query.get_or_404(id)
            
            if room.tenant_id:
                return make_response({"error": "Cannot delete room with active tenant"}, 400)
            
            db.session.delete(room)
            db.session.commit()
            return make_response({"message": "Room deleted"}, 200)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 500)


# ------------------ TENANTS CRUD ---------------------- #
class Tenants(Resource):
    @jwt_required()
    def get(self):
        try:
            tenants = Tenant.query.all()
            data = [{
                "id": t.id,
                "name": t.tenant_name,
                "phone": t.phone_number,
                "email": t.tenant_email,
                "room_id": t.room_id,
                "moving_in_date": t.moving_in_date.isoformat() if t.moving_in_date else None
            } for t in tenants]
            return make_response(data, 200)
        except Exception as e:
            return make_response({"error": str(e)}, 500)

    @jwt_required()
    def post(self):
        try:
            data = request.get_json()
            
            # Only require name, phone, and email
            if not all(k in data for k in ("name", "phone", "email")):
                return make_response({"error": "Missing required fields: name, phone, email"}, 400)
            
            # Create tenant without room assignment
            new_tenant = Tenant(
                tenant_name=data["name"], 
                phone_number=data["phone"],
                tenant_email=data["email"],
                moving_in_date=datetime.date.today()
            )
            
            db.session.add(new_tenant)
            db.session.commit()
            
            return make_response({
                "id": new_tenant.id,
                "name": new_tenant.tenant_name,
                "phone": new_tenant.phone_number,
                "email": new_tenant.tenant_email,
                "room_id": None,
                "moving_in_date": new_tenant.moving_in_date.isoformat() if new_tenant.moving_in_date else None
            }, 201)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 500)

class TenantById(Resource):
    @jwt_required()
    def patch(self, id):
        try:
            tenant = Tenant.query.get_or_404(id)
            data = request.get_json()

            if "name" in data:
                tenant.tenant_name = data["name"]
            if "phone" in data:
                tenant.phone_number = data["phone"]
            if "email" in data:
                tenant.tenant_email = data["email"]

            db.session.commit()
            return make_response({"message": "Tenant updated"}, 200)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 500)

    @jwt_required()
    def delete(self, id):
        try:
            tenant = Tenant.query.get_or_404(id)

            # Find and free the room if tenant is assigned
            room = Room.query.filter_by(tenant_id=tenant.id).first()
            if room:
                room.status = "vacant"
                room.tenant_id = None

            db.session.delete(tenant)
            db.session.commit()

            return make_response({"message": "Tenant deleted"}, 200)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 500)


# ------------------ PAYMENTS CRUD ---------------------- #
class Payments(Resource):
    @jwt_required()
    def get(self):
        try:
            payments = Payment.query.all()
            data = [{
                "id": p.id,
                "amount": p.payment_price,
                "date": p.payment_date.isoformat() if p.payment_date else None,
                "tenant_id": p.tenant_id,
                "mpesa_receipt": getattr(p, 'mpesa_receipt', None),
                "phone_number": getattr(p, 'phone_number', None)
            } for p in payments]
            return make_response(data, 200)
        except Exception as e:
            return make_response({"error": str(e)}, 500)

    @jwt_required()
    def post(self):
        try:
            data = request.get_json()
            
            if not all(k in data for k in ("amount", "tenant_id")):
                return make_response({"error": "Missing required fields"}, 400)
            
            tenant = Tenant.query.get(data["tenant_id"])
            if not tenant:
                return make_response({"error": "Tenant not found"}, 404)
            
            new_payment = Payment(
                payment_price=data["amount"], 
                tenant_id=data["tenant_id"],
                payment_date=datetime.date.today()
            )
            db.session.add(new_payment)
            db.session.commit()

            return make_response({
                "payment": {
                    "id": new_payment.id,
                    "amount": new_payment.payment_price,
                    "date": new_payment.payment_date.isoformat(),
                    "tenant_id": new_payment.tenant_id
                }
            }, 201)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 500)

class PaymentById(Resource):
    @jwt_required()
    def put(self, id):
        try:
            payment = Payment.query.get_or_404(id)
            data = request.get_json()
            
            if "amount" in data:
                payment.payment_price = data["amount"]
            
            db.session.commit()
            
            return make_response({
                "id": payment.id,
                "amount": payment.payment_price,
                "date": payment.payment_date.isoformat() if payment.payment_date else None,
                "tenant_id": payment.tenant_id
            }, 200)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 500)


# ------------------ M-PESA INTEGRATION ---------------------- #
class MpesaSTKPush(Resource):
    """Initiate M-Pesa STK Push for payment"""
    @jwt_required()
    def post(self):
        try:
            data = request.get_json()
            phone_number = data.get("phone_number")
            amount = data.get("amount")
            tenant_id = data.get("tenant_id")
            
            if not all([phone_number, amount, tenant_id]):
                return make_response({"error": "Missing required fields"}, 400)
            
            # TODO: Implement actual M-Pesa STK Push logic here
            # For now, return success message
            return make_response({
                "success": True,
                "message": "STK Push sent. Check your phone.",
                "phone_number": phone_number,
                "amount": amount
            }, 200)
            
        except Exception as e:
            return make_response({"error": str(e)}, 500)


class MpesaCallback(Resource):
    """Handle M-Pesa callback after payment"""
    def post(self):
        try:
            data = request.get_json()
            
            # Extract M-Pesa callback data
            # This structure may vary based on your M-Pesa integration
            result_code = data.get("Body", {}).get("stkCallback", {}).get("ResultCode")
            
            if result_code == 0:  # Success
                callback_metadata = data.get("Body", {}).get("stkCallback", {}).get("CallbackMetadata", {}).get("Item", [])
                
                amount = None
                mpesa_receipt = None
                phone_number = None
                
                for item in callback_metadata:
                    if item.get("Name") == "Amount":
                        amount = item.get("Value")
                    elif item.get("Name") == "MpesaReceiptNumber":
                        mpesa_receipt = item.get("Value")
                    elif item.get("Name") == "PhoneNumber":
                        phone_number = item.get("Value")
                
                # Create payment record
                # NOTE: You'll need to add tenant_id tracking, possibly via transaction ID
                new_payment = Payment(
                    payment_price=amount,
                    payment_date=datetime.date.today(),
                    tenant_id=1  # TODO: Link to actual tenant
                )
                
                db.session.add(new_payment)
                db.session.commit()
                
                return make_response({"message": "Payment recorded successfully"}, 200)
            
            return make_response({"message": "Payment failed or cancelled"}, 200)
            
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 500)


# ------------------ RESOURCE ROUTES ---------------------- #
api.add_resource(Home, '/')
api.add_resource(UserLogin, '/login')
api.add_resource(Rooms, '/rooms')
api.add_resource(RoomById, '/rooms/<int:id>')
api.add_resource(Tenants, '/tenants')
api.add_resource(TenantById, '/tenants/<int:id>')
api.add_resource(Payments, '/payments')
api.add_resource(PaymentById, '/payments/<int:id>')
api.add_resource(MpesaSTKPush, '/mpesa/stkpush')
api.add_resource(MpesaCallback, '/mpesa/callback')

# ------------------ START APP ---------------------- #
if __name__ == "__main__":
    app.run(port=5555, debug=True)