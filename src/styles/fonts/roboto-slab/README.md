# Roboto Slab

`RobotoSlab.woff2` is the unmodified Latin variable font served by
[Google Fonts](https://fonts.gstatic.com/s/robotoslab/v36/BngMUXZYTXPIvIBgJJSb6ufN5qWr4xCC.woff2),
version 2.002. Its [Apache 2.0 license](https://github.com/google/fonts/blob/main/apache/robotoslab/LICENSE.txt)
is included in `LICENSE.txt`.

The site loads the 600 and 700 weights with `next/font/local`, keeping the
`--font-roboto-slab` variable and Times New Roman fallback. Bundling this font
avoids the Google Fonts responses that crash Next.js's Google font loader
while extracting font-file extensions during production builds.

This preserves the existing Latin heading appearance. Characters outside the
bundled subset use the site's serif fallback stack.
