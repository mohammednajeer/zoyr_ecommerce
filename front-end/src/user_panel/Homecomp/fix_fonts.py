import re

file_path = r'd:\E COMMERCE\front-end\src\user_panel\Homecomp\Home.css'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    css = f.read()

# 1. Update font imports to include Playfair Display instead of Orbitron/Michroma/Space Grotesk
new_import = "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');"
css = css.replace("@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Michroma&family=Space+Grotesk:wght@300;400;600;700&display=swap');", new_import)

# 2. Replace all global Orbitron (which used to be Bebas Neue) with Playfair Display
css = css.replace("font-family: 'Orbitron', sans-serif;", "font-family: 'Playfair Display', serif;")

# 3. Update the specific hero titles to be smaller and use the new luxury fonts
brand_target = """  font-family: 'Michroma', sans-serif;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  color: var(--gold);
  letter-spacing: 0.35em;
  text-shadow: 0 0 15px var(--gold-glow);
  margin-bottom: 8px;"""

brand_replacement = """  font-family: 'Outfit', sans-serif;
  font-size: clamp(0.9rem, 1.5vw, 1.2rem);
  font-weight: 300;
  color: var(--gold);
  letter-spacing: 0.4em;
  text-shadow: 0 0 15px var(--gold-glow);
  margin-bottom: 4px;
  text-transform: uppercase;"""

model_target = """  font-family: 'Playfair Display', serif;
  font-size: clamp(4.5rem, 7vw, 7.5rem);
  color: #fff;
  letter-spacing: 0.02em;
  text-shadow: 0 4px 30px rgba(0,0,0,0.9);"""

model_replacement = """  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 4vw, 4.5rem);
  font-weight: 500;
  color: #fff;
  letter-spacing: 0.03em;
  text-shadow: 0 4px 30px rgba(0,0,0,0.9);
  text-transform: uppercase;"""

css = css.replace(brand_target, brand_replacement)
css = css.replace(model_target, model_replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(css)

print('Successfully updated Home.css fonts to luxury')
