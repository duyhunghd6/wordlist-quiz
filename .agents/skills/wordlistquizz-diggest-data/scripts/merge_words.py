import json
import sys
import os

def merge_words(new_data_file, target_file):
    if not os.path.exists(new_data_file):
        print(f"Error: {new_data_file} not found.", file=sys.stderr)
        sys.exit(1)
        
    if not os.path.exists(target_file):
        print(f"Error: {target_file} not found.", file=sys.stderr)
        sys.exit(1)

    try:
        with open(new_data_file, 'r', encoding='utf-8') as f:
            new_words = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing {new_data_file}: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        with open(target_file, 'r', encoding='utf-8') as f:
            existing_words = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing {target_file}: {e}", file=sys.stderr)
        sys.exit(1)

    existing_words_set = {entry['word'].lower() for entry in existing_words}

    added_count = 0
    duplicate_count = 0
    
    for entry in new_words:
        if 'word' not in entry:
            print("Skipping invalid entry (missing 'word' key):", entry)
            continue
            
        if entry['word'].lower() not in existing_words_set:
            existing_words.append(entry)
            existing_words_set.add(entry['word'].lower())
            added_count += 1
        else:
            duplicate_count += 1

    with open(target_file, 'w', encoding='utf-8') as f:
        json.dump(existing_words, f, indent=2, ensure_ascii=False)

    print(f"Successfully added {added_count} new words to {target_file}")
    if duplicate_count > 0:
        print(f"Skipped {duplicate_count} duplicates.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 merge_words.py <new_words.json> <target_db.json>")
        sys.exit(1)
        
    merge_words(sys.argv[1], sys.argv[2])
