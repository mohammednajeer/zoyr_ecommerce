import re

file_path = r'd:\E COMMERCE\front-end\src\user_panel\Homecomp\Home.css'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    css = f.read()

# 1. Update font imports
new_import = "@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Michroma&family=Space+Grotesk:wght@300;400;600;700&display=swap');"
css = css.replace("@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@200;300;400;500;600;700&display=swap');", 
    "@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@200;300;400;500;600;700&display=swap');\n" + new_import)

# 2. Update the gold color variables to a futuristic luminous gold
css = re.sub(r'--gold:\s*#[a-fA-F0-9]+;', '--gold:        #FFD700;', css)
css = re.sub(r'--gold-bright:\s*#[a-fA-F0-9]+;', '--gold-bright: #FFF2A8;', css)
css = re.sub(r'--gold-dim:\s*rgba\([^)]+\);', '--gold-dim:    rgba(255, 215, 0, 0.12);', css)
css = re.sub(r'--gold-glow:\s*rgba\([^)]+\);', '--gold-glow:   rgba(255, 215, 0, 0.4);', css)

# 3. Update Bebas Neue to Orbitron globally
css = css.replace("font-family: 'Bebas Neue', sans-serif;", "font-family: 'Orbitron', sans-serif;")

# 4. Give the brand text an even more futuristic vibe
brand_target = """  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  color: var(--gold);
  letter-spacing: 0.08em;
  text-shadow: 0 4px 20px rgba(0,0,0,0.8);"""

brand_replacement = """  font-family: 'Michroma', sans-serif;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  color: var(--gold);
  letter-spacing: 0.35em;
  text-shadow: 0 0 15px var(--gold-glow);
  margin-bottom: 8px;"""

css = css.replace(brand_target, brand_replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(css)

print('Successfully updated Home.css')
