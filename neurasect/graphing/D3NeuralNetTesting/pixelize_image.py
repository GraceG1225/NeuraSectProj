import numpy as np
from PIL import Image

img = Image.open("input.jpg").convert("RGB")
x = np.array(img)
print(x)
block = 256  # block size in pixels
h, w = x.shape[:2]
h2, w2 = (h // block) * block, (w // block) * block
x = x[:h2, :w2]
kernel = 3*3
# 64x64  * 3x3 = 62x62 for conv

# average each block
y = x.reshape(h2//block, block, w2//block, block, 3).mean(axis=(1,3))

# expand back to blocks
y = np.repeat(np.repeat(y, block, axis=0),block, axis=1).astype(np.uint8)

Image.fromarray(y).save("pixelated_avg.jpg")
