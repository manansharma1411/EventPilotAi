-- ==============================================================================
-- EventPilot AI - Safe Demo Seed Data
-- Architecture: Sample directory vendors for architectural evaluation
-- NOTE: These demo vendors are simulated examples and do NOT represent
-- live vendor rates, contact information, or real booking availability.
-- ==============================================================================

insert into public.vendors (id, name, category, location, contact_info, source, verification_status, is_public)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'Sonoma Valley Glass Pavilion',
    'venue',
    'Sonoma, CA',
    '{"website": "https://example.com/sonoma-glass", "notes": "Demo listing - simulated capacity 200 guests"}'::jsonb,
    'platform',
    'verified',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Artisan Farmstead Catering & Bar',
    'catering',
    'San Francisco, CA',
    '{"website": "https://example.com/artisan-catering", "notes": "Demo listing - farm-to-table organic menus"}'::jsonb,
    'platform',
    'verified',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Golden Hour Cinema & Editorial Stills',
    'photography',
    'Napa, CA',
    '{"website": "https://example.com/golden-hour-photo", "notes": "Demo listing - dual cinema camera coverage"}'::jsonb,
    'platform',
    'featured',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Metropolitan Brass & Live DJ Ensemble',
    'entertainment',
    'Oakland, CA',
    '{"website": "https://example.com/metro-brass", "notes": "Demo listing - 6-piece hybrid brass collective"}'::jsonb,
    'platform',
    'verified',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Botanical Statements & Lighting Rigging',
    'decor',
    'San Jose, CA',
    '{"website": "https://example.com/botanical-decor", "notes": "Demo listing - bespoke architectural florals"}'::jsonb,
    'platform',
    'unverified',
    true
  )
on conflict (id) do nothing;
