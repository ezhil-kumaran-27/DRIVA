"""initial schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-08 16:10:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('company_name', sa.String(255), nullable=True),
        sa.Column('role', sa.String(50), nullable=False, server_default='business'),
        sa.Column('is_active', sa.Boolean(), server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # Providers table
    op.create_table(
        'providers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False, unique=True),
        sa.Column('code', sa.String(50), nullable=False),
        sa.Column('fleet_type', sa.String(100), server_default='Mixed Fleet'),
        sa.Column('capacity_kg', sa.Float(), nullable=False),
        sa.Column('base_rate_per_km', sa.Float(), nullable=False),
        sa.Column('reliability_score', sa.Float(), nullable=False),
        sa.Column('avg_rating', sa.Float(), server_default='4.5'),
        sa.Column('total_trips', sa.Integer(), server_default='150'),
        sa.Column('is_ev', sa.Boolean(), server_default='0'),
        sa.Column('is_active', sa.Boolean(), server_default='1'),
        sa.Column('contact_phone', sa.String(50), server_default='+91 98765 43210'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # Transport Requests table
    op.create_table(
        'transport_requests',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('origin', sa.String(255), nullable=False),
        sa.Column('destination', sa.String(255), nullable=False),
        sa.Column('cargo_weight', sa.Float(), nullable=False),
        sa.Column('cargo_type', sa.String(100), server_default='General Merchandise'),
        sa.Column('deadline', sa.String(100), server_default='Today'),
        sa.Column('deadline_timestamp', sa.DateTime(), nullable=True),
        sa.Column('special_requirements', sa.String(500), nullable=True),
        sa.Column('status', sa.String(50), server_default='PENDING'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # Recommendations table
    op.create_table(
        'recommendations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('request_id', sa.Integer(), sa.ForeignKey('transport_requests.id'), nullable=False),
        sa.Column('provider_id', sa.Integer(), sa.ForeignKey('providers.id'), nullable=False),
        sa.Column('predicted_cost', sa.Float(), nullable=False),
        sa.Column('predicted_eta_hours', sa.Float(), nullable=False),
        sa.Column('suitability_score', sa.Float(), nullable=False),
        sa.Column('match_score', sa.Float(), nullable=False),
        sa.Column('rank', sa.Integer(), server_default='1'),
        sa.Column('ai_explanation', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # Bookings table
    op.create_table(
        'bookings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('booking_reference', sa.String(50), nullable=False, unique=True),
        sa.Column('request_id', sa.Integer(), sa.ForeignKey('transport_requests.id'), nullable=False),
        sa.Column('provider_id', sa.Integer(), sa.ForeignKey('providers.id'), nullable=False),
        sa.Column('recommendation_id', sa.Integer(), sa.ForeignKey('recommendations.id'), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('total_cost', sa.Float(), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='CONFIRMED'),
        sa.Column('driver_name', sa.String(100), server_default='Ramesh Kumar'),
        sa.Column('driver_phone', sa.String(50), server_default='+91 94432 18902'),
        sa.Column('vehicle_number', sa.String(50), server_default='TN-30-AX-8912'),
        sa.Column('current_location', sa.String(255), server_default='Salem Logistics Hub'),
        sa.Column('latitude', sa.Float(), server_default='11.6643'),
        sa.Column('longitude', sa.Float(), server_default='78.1460'),
        sa.Column('status_history_json', sa.Text(), server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )

    # Reviews table
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('booking_id', sa.Integer(), sa.ForeignKey('bookings.id'), nullable=False, unique=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('provider_id', sa.Integer(), sa.ForeignKey('providers.id'), nullable=False),
        sa.Column('rating', sa.Float(), nullable=False),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

def downgrade() -> None:
    op.drop_table('reviews')
    op.drop_table('bookings')
    op.drop_table('recommendations')
    op.drop_table('transport_requests')
    op.drop_table('providers')
    op.drop_table('users')
