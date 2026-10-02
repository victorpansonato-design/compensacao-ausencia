"""Monta o index.html autocontido a partir de src/, assets/ e docs/.
Requer: npm install (fonte Geist) e Python 3."""
import base64, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
b64 = lambda p: base64.b64encode((R / p).read_bytes()).decode()
css = (R / 'src/styles.css').read_text(encoding='utf-8') + (R / 'src/demo.css').read_text(encoding='utf-8')
css = css.replace('__GEIST__', b64('node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2'))
css = css.replace('__GEISTMONO__', b64('node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2'))
js = ('const ICONS = ' + (R / 'src/icons.json').read_text(encoding='utf-8') + ';\n'
      + f'const LOGO_B64 = "{b64("assets/logo.png")}";\n'
      + f'const EBOOK_B64 = "{b64("docs/Regulamento_simples_Compensacao_de_Ausencias.pdf")}";\n'
      + (R / 'src/components.js').read_text(encoding='utf-8') + '\n' + (R / 'src/demo.js').read_text(encoding='utf-8'))
html = ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
        f'<title>Compensação de ausências · UniAnchieta</title><style>{css}</style></head>'
        f'<body><div id="root"></div><div id="toast" aria-live="polite"></div><script>{js}</script></body></html>')
(R / 'index.html').write_text(html, encoding='utf-8', newline='\n')
print(f'index.html gerado ({len(html) // 1024} KB)')
