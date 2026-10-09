import json

raw_tabs = "E5 G5 D5 | C5 D5 | E5 G5 D5 | E5 G5 D6 C6 G5 | F5 E5 D5 | E5 G5 D5 | C5 D5 | E5 G5 D5 | E5 G5 D6 C6 G5 | G5 F5 E5 F5 E5 C5 | F5 E5 D5 E5 D5 A4 | G5 F5 E5 F5 E5 C5 | F5 C6 | E5 G5 D5 | C5 D5 | E5 G5 D5 | E5 G5 D6 C6 G5 |"

notes_array = []
tokens = raw_tabs.split()
for t in tokens:
    if t == '|':
        notes_array.append({"break": True})
    else:
        notes_array.append({"n": t})

# Remove trailing break if exists
if notes_array and "break" in notes_array[-1]:
    notes_array.pop()

print(json.dumps(notes_array, separators=(',', ':')))
