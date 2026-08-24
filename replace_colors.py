import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace gradients with solid #C05746
    content = content.replace("bg-gradient-to-r from-[#F56D41] to-[#8D5DF5]", "bg-[#C05746]")
    content = content.replace("bg-gradient-to-br from-[#F56D41] to-[#8D5DF5]", "bg-[#C05746]")
    content = content.replace("bg-gradient-to-r from-[#F56D41] to-[#8D5DF5]", "bg-[#C05746]")
    content = content.replace("bg-gradient-to-b from-[#F56D41] to-[#8D5DF5]", "bg-[#C05746]")
    content = content.replace("group-hover:bg-gradient-to-r group-hover:from-[#F56D41] group-hover:to-[#8D5DF5]", "group-hover:bg-[#C05746]")
    
    # Replace other purple usages with solid #C05746
    content = content.replace("text-[#8D5DF5]", "text-[#C05746]")
    content = content.replace("border-[#8D5DF5]", "border-[#C05746]")
    content = content.replace("bg-[#8D5DF5]", "bg-[#C05746]")
    
    # CSS gradient replacements for index.css
    content = content.replace("linear-gradient(to right, #F56D41, #8D5DF5)", "#C05746")
    content = content.replace("linear-gradient(to bottom right, #F56D41, #8D5DF5)", "#C05746")
    content = content.replace("to-[#8D5DF5]", "") # Clean up any trailing 'to' color if left over
    content = content.replace("from-[#F56D41]", "bg-[#C05746]")

    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            replace_in_file(os.path.join(root, file))

print("Colors updated successfully.")
