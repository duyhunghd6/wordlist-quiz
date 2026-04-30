# Tooling & Scripts Guidelines

## ESL Data Pipeline Tools
We have a set of automated scripts to generate images for vocabulary words and map them to the main `wordlist_esl.json` file. These tools are located in `scripts/data_pipeline/`.

### 1. Generating Prompts
To generate rigorous, pedagogical, dictionary-style image prompts for units 5-9 using the Gemini 3 Flash model:
```bash
node scripts/data_pipeline/generate_prompts.js
```
*Output*: Generates `public/db/esl_prompts.json` containing the clever visual metaphors.

### 2. Generating Images
To take the prompts from `esl_prompts.json` and generate the actual images using Gemini 2.5 Flash Image (`gemini-2.5-flash-image`), run:
```bash
node scripts/data_pipeline/generate_esl_images.js
```
*Output*: Saves `.png` images directly to `public/db/esl/`. The script automatically skips existing images, making it safe to rerun if you hit an API quota limit.

### 3. Mapping Images to Wordlist
After generating images, you must map the file paths back to the JSON database:
```bash
node scripts/data_pipeline/map_images.js
```
*Output*: Scans `public/db/esl/` and updates `public/db/wordlist_esl.json` with the new `"image"` fields.

## Math Data Pipeline Tools
We have an identical, parallel pipeline specifically for the Math vocabulary, configured with strict pedagogical rules for visualizing mathematical concepts.

### 1. Generating Math Prompts
```bash
node scripts/data_pipeline/generate_math_prompts.js
```
*Output*: Generates `public/db/math_prompts.json`.

### 2. Generating Math Images
```bash
node scripts/data_pipeline/generate_math_images.js
```
*Output*: Generates images and saves them to `public/db/math/`.

### 3. Mapping Math Images
```bash
node scripts/data_pipeline/map_math_images.js
```
*Output*: Updates `public/db/wordlist_math.json`.
