#!/usr/bin/env python3
"""
Generate simple placeholder PNG icons for the Fillr extension
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("PIL/Pillow not found. Installing...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    """Create a simple icon with blue background and white text"""

    # Create image with blue background
    img = Image.new('RGB', (size, size), color='#2563eb')
    draw = ImageDraw.Draw(img)

    # Draw a white circle border
    border_width = max(2, size // 16)
    padding = size // 6
    draw.ellipse(
        [padding, padding, size - padding, size - padding],
        outline='white',
        width=border_width
    )

    # Draw a simple "F" or arrow-down shape
    if size >= 48:
        # Draw an arrow pointing down (fill icon concept)
        arrow_width = size // 4
        arrow_top = size // 3
        arrow_bottom = size * 2 // 3
        center_x = size // 2

        # Draw arrow shaft
        draw.rectangle(
            [center_x - arrow_width // 4, arrow_top,
             center_x + arrow_width // 4, arrow_bottom - arrow_width // 2],
            fill='white'
        )

        # Draw arrow head (triangle)
        draw.polygon(
            [
                (center_x - arrow_width, arrow_bottom - arrow_width // 2),
                (center_x + arrow_width, arrow_bottom - arrow_width // 2),
                (center_x, arrow_bottom)
            ],
            fill='white'
        )
    else:
        # For 16x16, just draw a simple down arrow
        center_x = size // 2
        arrow_top = size // 4
        arrow_bottom = size * 3 // 4

        # Simple line arrow
        draw.line(
            [(center_x, arrow_top), (center_x, arrow_bottom)],
            fill='white',
            width=2
        )
        draw.line(
            [(center_x - 3, arrow_bottom - 3), (center_x, arrow_bottom)],
            fill='white',
            width=2
        )
        draw.line(
            [(center_x + 3, arrow_bottom - 3), (center_x, arrow_bottom)],
            fill='white',
            width=2
        )

    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

if __name__ == '__main__':
    import os

    # Create icons directory if it doesn't exist
    icons_dir = 'icons'
    if not os.path.exists(icons_dir):
        os.makedirs(icons_dir)

    # Generate all three icon sizes
    create_icon(16, os.path.join(icons_dir, 'icon16.png'))
    create_icon(48, os.path.join(icons_dir, 'icon48.png'))
    create_icon(128, os.path.join(icons_dir, 'icon128.png'))

    print("\nAll icons generated successfully!")
    print("Icons are saved in the 'icons/' directory.")
