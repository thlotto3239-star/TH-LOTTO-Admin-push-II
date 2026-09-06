"""Extract dominant colors from the uploaded esports logo (evidence for theming)."""
from PIL import Image
from collections import Counter

PATH = '/home/z/my-project/upload/สีแดงและสีดำ อีสปอร์ต ที่มีภาพประกอบ เล่นเกม เล่นเกม โลโก้.png'

img = Image.open(PATH).convert('RGB')
small = img.resize((256, 256))
pixels = list(small.getdata())
total = len(pixels)

def bucket(px, step=16):
    return tuple((c // step) * step for c in px)

counts = Counter(bucket(p) for p in pixels)

print(f"Image: {Image.open(PATH).size}, sampled {total} px")
print("\nTop 12 color buckets (step=16):")
for color, n in counts.most_common(12):
    hexv = '#%02x%02x%02x' % color
    print(f"  {hexv}  rgb{color}  {100*n/total:.1f}%")

def avg_of(pred, label):
    sel = [p for p in pixels if pred(p)]
    if not sel:
        print(f"{label}: none")
        return
    r = sum(p[0] for p in sel) // len(sel)
    g = sum(p[1] for p in sel) // len(sel)
    b = sum(p[2] for p in sel) // len(sel)
    print(f"{label}: #{r:02x}{g:02x}{b:02x}  rgb({r},{g},{b})  {100*len(sel)/total:.1f}% px")

print("\nRefined averages by color family:")
avg_of(lambda p: p[1] > 110 and p[0] < p[1] - 30 and p[2] < p[1] - 30, "bright green ")
avg_of(lambda p: 40 < p[1] <= 110 and p[0] < p[1] - 20 and p[2] < p[1] - 20, "dark green   ")
avg_of(lambda p: p[0] < 40 and p[1] < 40 and p[2] < 40, "black        ")
