#!/usr/bin/env python3
"""
Generate Fillr extension icons with Lightning Fill design
Blue/Electric blue gradient with lightning bolt through form
"""

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("PIL/Pillow not found. Installing...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw

def create_icon(size, filename):
    """Create icon with lightning bolt through form design"""

    # Create image with transparency
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Colors
    bg_blue = (37, 99, 235)      # #2563eb - Electric blue
    light_blue = (59, 130, 246)  # #3b82f6 - Lighter blue
    white = (255, 255, 255, 255)
    lightning_yellow = (250, 204, 21, 255)  # #facc15 - Electric yellow

    # Background - rounded rectangle
    padding = size // 16
    corner_radius = size // 8
    draw.rounded_rectangle(
        [(padding, padding), (size - padding, size - padding)],
        radius=corner_radius,
        fill=bg_blue
    )

    # Add gradient effect with lighter blue at top
    for i in range(size // 2):
        alpha = int(100 * (1 - i / (size / 2)))
        draw.line([(padding, padding + i), (size - padding, padding + i)],
                 fill=light_blue + (alpha,), width=1)

    # Form lines (horizontal lines representing a document/form)
    line_width = max(1, size // 32)
    form_color = white[:3] + (180,)  # Semi-transparent white

    if size >= 48:
        # Multiple form lines for larger icons
        line_spacing = size // 6
        line_start_y = size // 4
        for i in range(3):
            y = line_start_y + (i * line_spacing)
            draw.rounded_rectangle(
                [(size // 4, y), (size * 3 // 4, y + line_width)],
                radius=line_width // 2,
                fill=form_color
            )
    else:
        # Simpler design for 16x16
        y = size // 2
        draw.rectangle(
            [(size // 4, y - 1), (size * 3 // 4, y + 1)],
            fill=form_color
        )

    # Lightning bolt - dynamic path based on size
    bolt_width = max(2, size // 16)

    if size >= 48:
        # Detailed lightning bolt for larger icons
        lightning_points = [
            (size * 0.55, size * 0.2),   # Top
            (size * 0.45, size * 0.45),  # Middle left
            (size * 0.52, size * 0.45),  # Middle right (zigzag)
            (size * 0.42, size * 0.75),  # Bottom left
            (size * 0.50, size * 0.50),  # Back to middle
            (size * 0.45, size * 0.50),  # Middle left again
        ]

        # Draw lightning with outline for visibility
        # Outer glow (darker)
        for offset in range(3, 0, -1):
            glow_points = [(x, y) for x, y in lightning_points]
            draw.line(glow_points, fill=lightning_yellow[:3] + (50 * offset,),
                     width=bolt_width + offset * 2, joint='curve')

        # Main lightning bolt
        draw.line(lightning_points, fill=lightning_yellow,
                 width=bolt_width, joint='curve')

        # Inner highlight
        draw.line(lightning_points, fill=(255, 255, 200, 255),
                 width=max(1, bolt_width // 2), joint='curve')
    else:
        # Simple lightning for 16x16
        lightning_points = [
            (size * 0.55, size * 0.25),
            (size * 0.45, size * 0.50),
            (size * 0.52, size * 0.50),
            (size * 0.42, size * 0.75),
        ]
        draw.line(lightning_points, fill=lightning_yellow, width=2)

    # Save the image
    img.save(filename, 'PNG')
    return img

if __name__ == '__main__':
    import os

    script_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(script_dir, 'icons')

    # Ensure icons directory exists
    os.makedirs(icons_dir, exist_ok=True)

    # Icon sizes required by Chrome
    sizes = [
        (16, 'icon16.png'),
        (48, 'icon48.png'),
        (128, 'icon128.png')
    ]

    print("Generating Fillr icons with Lightning Fill design...")
    print("=" * 50)

    for size, filename in sizes:
        filepath = os.path.join(icons_dir, filename)
        print(f"Creating {filename} ({size}x{size})...", end=' ')

        icon = create_icon(size, filepath)

        # Get file size
        file_size = os.path.getsize(filepath)
        print(f"OK ({file_size:,} bytes)")

    print("=" * 50)
    print("All icons generated successfully!")
    print(f"Location: {icons_dir}")
    print("\nNext steps:")
    print("1. Go to chrome://extensions/")
    print("2. Click 'Reload' on the Fillr extension")
    print("3. The new icons should appear!")
