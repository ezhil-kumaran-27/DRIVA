from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.user import User
from app.models.provider import Provider

def seed_database(db: Session = None):
    close_at_end = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_at_end = True

    try:
        # 1. Seed Users
        if not db.query(User).filter(User.email == "business@driva.com").first():
            business_user = User(
                email="business@driva.com",
                hashed_password=hash_password("driva123"),
                full_name="Praveen Enterprise Manager",
                company_name="Apex Manufacturing Corp",
                role="business"
            )
            db.add(business_user)

        if not db.query(User).filter(User.email == "admin@driva.com").first():
            admin_user = User(
                email="admin@driva.com",
                hashed_password=hash_password("driva123"),
                full_name="DRIVA Platform Admin",
                company_name="DRIVA Logistics Technologies",
                role="admin"
            )
            db.add(admin_user)

        # 2. Seed Logistics Providers
        providers_data = [
            {
                "name": "ABC Logistics",
                "code": "ABC-LOG",
                "fleet_type": "Medium Commercial Freight",
                "capacity_kg": 1200.0,
                "base_rate_per_km": 16.5,
                "reliability_score": 0.98,
                "avg_rating": 4.8,
                "total_trips": 420,
                "is_ev": False,
                "contact_phone": "+91 98421 23450"
            },
            {
                "name": "GreenRoute Electric Freight",
                "code": "GRE-EV",
                "fleet_type": "Electric Light Commercial Vehicle",
                "capacity_kg": 800.0,
                "base_rate_per_km": 17.8,
                "reliability_score": 0.94,
                "avg_rating": 4.7,
                "total_trips": 180,
                "is_ev": True,
                "contact_phone": "+91 97890 12345"
            },
            {
                "name": "Apex Express Cargo",
                "code": "APX-EXP",
                "fleet_type": "High-Speed Highway Van",
                "capacity_kg": 1500.0,
                "base_rate_per_km": 19.0,
                "reliability_score": 0.96,
                "avg_rating": 4.9,
                "total_trips": 350,
                "is_ev": False,
                "contact_phone": "+91 94432 99887"
            },
            {
                "name": "Economy Haulers Ltd",
                "code": "ECO-HAUL",
                "fleet_type": "Standard Multi-Axle Freight",
                "capacity_kg": 4000.0,
                "base_rate_per_km": 14.2,
                "reliability_score": 0.89,
                "avg_rating": 4.3,
                "total_trips": 610,
                "is_ev": False,
                "contact_phone": "+91 98940 55443"
            }
        ]

        for p_data in providers_data:
            existing = db.query(Provider).filter(Provider.name == p_data["name"]).first()
            if not existing:
                p = Provider(**p_data)
                db.add(p)

        db.commit()
    finally:
        if close_at_end:
            db.close()

if __name__ == "__main__":
    seed_database()
    print("Database seeded successfully!")
