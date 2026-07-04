import dbConnect from "@/lib/db";
import Theme from "@/models/Theme";

export const dynamic = 'force-dynamic';

export default async function ThemeStyle() {
  await dbConnect();
  const themeDoc = await Theme.findOne({ isActive: true }).lean();
  
  if (!themeDoc) return null;

  // Final safety check for plain object serialization
  const activeTheme = JSON.parse(JSON.stringify(themeDoc));
  const { colors, typography, ui } = activeTheme.config;
  
  // Calculate modular scale for headings
  const scale = typography.headingScale || 1.25;
  const base = parseInt(typography.baseSize) || 16;
  
  const h1 = Math.round(base * Math.pow(scale, 4));
  const h2 = Math.round(base * Math.pow(scale, 3));
  const h3 = Math.round(base * Math.pow(scale, 2));
  const h4 = Math.round(base * Math.pow(scale, 1));

  // Map theme fonts to preloaded next/font variables to eliminate layout shift
  const fontMap = {
    'Inter': 'var(--font-inter)',
    'Poppins': 'var(--font-poppins)',
  };

  const headingFontVal = fontMap[typography.headingFont] || `"${typography.headingFont}"`;
  const bodyFontVal = fontMap[typography.bodyFont] || `"${typography.bodyFont}"`;

  // Generate CSS variables
  const cssVariables = `
    :root {
      --background: ${colors.background};
      --foreground: ${colors.foreground};
      --primary: ${colors.primary};
      --accent: ${colors.accent};
      --muted: ${colors.muted};
      --secondary: ${colors.secondary};
      --border: ${colors.border};
      --card: ${colors.card};
      
      --brand-font: ${headingFontVal}, sans-serif;
      --body-font: ${bodyFontVal}, sans-serif;
      
      --base-font-size: ${base}px;
      --h1-size: ${h1}px;
      --h2-size: ${h2}px;
      --h3-size: ${h3}px;
      --h4-size: ${h4}px;
      
      --radius: ${ui.borderRadius};
    }

    /* Apply global typography overrides */
    h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4 { 
      font-family: var(--brand-font); 
      font-weight: ${typography.headingWeight};
      letter-spacing: -0.02em; 
    }
    .h1 { font-size: var(--h1-size); }
    .h2 { font-size: var(--h2-size); }
    .h3 { font-size: var(--h3-size); }
    .h4 { font-size: var(--h4-size); }
    body { 
      font-family: var(--body-font);
      font-size: var(--base-font-size); 
      font-weight: ${typography.bodyWeight}; 
    }
  `;

  // Dynamic Font Loading (Only for non-preloaded fonts)
  const preloadedFonts = ['Inter', 'Poppins'];
  const fontFamilies = [...new Set([typography.headingFont, typography.bodyFont])]
    .filter(f => !preloadedFonts.includes(f));

  const googleFontsUrl = fontFamilies.length > 0
    ? `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900`).join('&')}&display=block`
    : null;

  return (
    <>
      {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
      <style id="dynamic-theme-vars" dangerouslySetInnerHTML={{ __html: cssVariables }} />
    </>
  );
}
