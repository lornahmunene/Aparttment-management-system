from app import app
from models import db, User
from werkzeug.security import generate_password_hash

print("🚀 Starting database seeding...")

with app.app_context():

    # Reset tables
    db.drop_all()
    db.create_all()

    print("🔄 Database recreated.")

    # ---------------------------------------
    # CREATE LANDLORD ONLY
    # ---------------------------------------
    manager = User(
        username="Manager",
        email="manager@aps.com",
        password=generate_password_hash("pass123"),
        role="manager"
    )
    db.session.add(manager)

    db.session.commit()
