-- ========================================
-- Organization Table
-- ========================================
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- ========================================
-- Insert sample data: Organizations
-- ========================================
INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- Create projects table
CREATE TABLE IF NOT EXISTS public.project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES public.organization(organization_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    project_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample projects (at least 5 per organization)
-- Assuming you have organizations with IDs 1, 2, 3

-- Organization 1 projects
INSERT INTO public.project (organization_id, title, description, location, project_date) VALUES
(1, 'Community Food Drive', 'Collecting and distributing food to local families in need', 'City Community Center', '2026-08-15'),
(1, 'School Supply Donation', 'Providing school supplies to underprivileged students', 'Downtown Elementary School', '2026-08-20'),
(1, 'Senior Care Package Program', 'Creating and delivering care packages to elderly residents', 'Sunset Retirement Home', '2026-09-01'),
(1, 'Community Garden Cleanup', 'Cleaning and maintaining community garden spaces', 'Green Valley Park', '2026-09-10'),
(1, 'Youth Mentorship Program', 'Connecting youth with professional mentors', 'Public Library', '2026-09-15');

-- Organization 2 projects
INSERT INTO public.project (organization_id, title, description, location, project_date) VALUES
(2, 'Beach Cleanup Day', 'Removing plastic and debris from local beaches', 'Sunset Beach', '2026-08-22'),
(2, 'Tree Planting Initiative', 'Planting native trees in urban areas', 'City Park', '2026-09-05'),
(2, 'Environmental Education Workshop', 'Teaching children about environmental conservation', 'Nature Center', '2026-09-12'),
(2, 'Recycling Program Expansion', 'Expanding recycling services to more neighborhoods', 'City Hall', '2026-09-20'),
(2, 'Sustainable Agriculture Project', 'Supporting local sustainable farming practices', 'Community Farm', '2026-10-01');

-- Organization 3 projects
INSERT INTO public.project (organization_id, title, description, location, project_date) VALUES
(3, 'Technology Training for Seniors', 'Teaching seniors how to use technology', 'Senior Center', '2026-08-25'),
(3, 'Digital Literacy Workshop', 'Providing digital literacy training to underserved communities', 'Community College', '2026-09-08'),
(3, 'Online Safety Awareness', 'Educating families about online safety', 'Public Library', '2026-09-18'),
(3, 'Computer Donation Program', 'Donating refurbished computers to families in need', 'Tech Hub', '2026-09-25'),
(3, 'Coding Bootcamp for Youth', 'Introducing youth to coding and programming', 'Innovation Center', '2026-10-05');

-- Create an index for better performance
CREATE INDEX idx_project_organization_id ON public.project(organization_id);
CREATE INDEX idx_project_date ON public.project(project_date);