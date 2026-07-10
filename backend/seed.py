"""Run once after the tables exist to create the two roles and a default
admin/user pair you can log in with immediately.

    python seed.py
"""
from app.database import SessionLocal, Base, engine
from app import models  # noqa: F401
from app.models.role import Role
from app.models.user import User
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    for role_name in ("admin", "user"):
        if not db.query(Role).filter(Role.name == role_name).first():
            db.add(Role(name=role_name))
    db.commit()

    admin_role = db.query(Role).filter(Role.name == "admin").first()
    user_role = db.query(Role).filter(Role.name == "user").first()

    if not db.query(User).filter(User.email == "admin@example.com").first():
        db.add(
            User(
                name="Admin",
                email="admin@example.com",
                password_hash=hash_password("admin123"),
                role_id=admin_role.id,
            )
        )

    if not db.query(User).filter(User.email == "user@example.com").first():
        db.add(
            User(
                name="Test User",
                email="user@example.com",
                password_hash=hash_password("user123"),
                role_id=user_role.id,
            )
        )

    db.commit()
    print("Seed complete.")
    print("Admin login -> admin@example.com / admin123")
    print("User login  -> user@example.com / user123")
finally:
    db.close()
