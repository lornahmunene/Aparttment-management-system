from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()

# ------------------- USER ------------------- #
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)   # manager / landlord

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "role": self.role
        }

# ------------------- ROOM ------------------- #
class Room(db.Model):
    __tablename__ = "rooms"

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(100), nullable=False, unique=True)      # e.g "A-12"
    status = db.Column(db.String(50), nullable=False, default="vacant")   # vacant / occupied
    type = db.Column(db.String(50), nullable=False, default="single")     # single, bedsitter, etc.
    rent_amount = db.Column(db.Float, nullable=False)

    # A room belongs to ONE tenant
    tenant_id = db.Column(db.Integer, db.ForeignKey("tenants.id"), nullable=True)

    # A room has many payments
    payments = db.relationship("Payment", backref="room", lazy=True)

    # Note: Maintenance relationship has been removed.

    def to_dict(self):
        return {
            "id": self.id,
            "room_id": self.room_id,
            "status": self.status,
            "type": self.type,
            "rent_amount": self.rent_amount,
            "tenant_id": self.tenant_id
        }

# ------------------- TENANT ------------------- #
class Tenant(db.Model):
    __tablename__ = "tenants"

    id = db.Column(db.Integer, primary_key=True)
    tenant_name = db.Column(db.String(255), nullable=False)
    tenant_email = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(50), nullable=True)
    national_id = db.Column(db.String(100), nullable=True)

    moving_in_date = db.Column(db.Date, nullable=False)
    moving_out_date = db.Column(db.Date, nullable=True)

    # A tenant can have MANY rooms
    rooms = db.relationship("Room", backref="tenant", lazy=True)

    # A tenant has many payments
    payments = db.relationship("Payment", backref="tenant", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_name": self.tenant_name,
            "tenant_email": self.tenant_email,
            "phone_number": self.phone_number,
            "national_id": self.national_id,
            "moving_in_date": self.moving_in_date.isoformat(),
            "moving_out_date": self.moving_out_date.isoformat() if self.moving_out_date else None,
        }

# ------------------- PAYMENT ------------------- #
class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    payment_date = db.Column(db.Date, nullable=False, default=date.today)
    payment_price = db.Column(db.Float, nullable=False)

    room_id = db.Column(db.Integer, db.ForeignKey("rooms.id"), nullable=False)
    tenant_id = db.Column(db.Integer, db.ForeignKey("tenants.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "payment_date": self.payment_date.isoformat(),
            "payment_price": self.payment_price,
            "room_id": self.room_id,
            "tenant_id": self.tenant_id
        }


