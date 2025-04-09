import requests
import re
from PIL import Image, ImageDraw, ImageFont
import os
import platform
from tqdm import tqdm
from colorama import Fore, Style, init
import pyfiglet
import shutil

init(autoreset=True)

def clear_screen():
    os.system('cls' if platform.system() == 'Windows' else 'clear')

def print_banner():
    banner = pyfiglet.Figlet(font="small")
    banner_text = banner.renderText("must")
    terminal_width = shutil.get_terminal_size().columns
    banner_lines = banner_text.split('\n')
    
    # Center each line of the banner
    centered_banner = []
    for line in banner_lines:
        centered_line = line.center(terminal_width)
        centered_banner.append(centered_line)

    # Print the centered banner
    print(Fore.CYAN + '\n'.join(centered_banner))

    # Center and style the Author/Github line with separate colors
    author_line = "Author/Github: "
    github_handle = "@sulmanfarooqq"
    author_line_colored = Fore.YELLOW + author_line + Fore.GREEN + github_handle
    print(author_line_colored.center(terminal_width) + "\n")

def download_and_convert_to_pdf(roll_numbers, pdf_name):
    try:
        sdcard_path = os.path.join(os.path.expanduser("~"), "MUST_GPA")
        os.makedirs(sdcard_path, exist_ok=True)

        image_filenames = []
        for roll_number in tqdm(roll_numbers, desc="Processing", unit="roll", bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt}"):
            pattern = r"^FA\d{2}-[A-Z]{3}-\d{3}$"
            if not re.match(pattern, roll_number):
                raise ValueError(f"Invalid roll number format: {roll_number}. Please use FAXX-ABC-000")

            image_url = f"https://cms.must.edu.pk:8082/Chartlet/MUST{roll_number}AJK/FanG_Chartlet_GPChart.Jpeg"

            try:
                response = requests.get(image_url, stream=True)
                response.raise_for_status()

                image_filename = os.path.join(sdcard_path, f"{roll_number}.jpeg")
                with open(image_filename, 'wb') as file:
                    for chunk in response.iter_content(chunk_size=8192):
                        file.write(chunk)

                img = Image.open(image_filename)
                draw = ImageDraw.Draw(img)
                font_size = 36
                font = ImageFont.load_default()
                text_width = draw.textlength(roll_number, font=font)
                text_height = font.getbbox(roll_number)[3]
                x = img.width - text_width - 10
                y = img.height - text_height - 10
                draw.text((x, y), roll_number, font=font, fill=(0, 0, 0))
                img.save(image_filename)

                image_filenames.append(image_filename)

            except requests.exceptions.RequestException:
                img = Image.new('RGB', (200, 100), color='white')
                draw = ImageDraw.Draw(img)
                font = ImageFont.load_default()
                text_width = draw.textlength(roll_number, font=font)
                text_height = font.getbbox(roll_number)[3]
                x = (img.width - text_width) // 2
                y = (img.height - text_height) // 2
                draw.text((x, y), roll_number, font=font, fill=(0, 0, 0))
                image_filename = os.path.join(sdcard_path, f"{roll_number}.jpeg")
                img.save(image_filename)
                image_filenames.append(image_filename)

        images = [Image.open(img) for img in image_filenames]
        pdf_filename = os.path.join(sdcard_path, f"{pdf_name}.pdf")
        images[0].save(pdf_filename, "PDF", resolution=100.0, save_all=True, append_images=images[1:])

        for img_file in image_filenames:
            os.remove(img_file)

        print(Fore.GREEN + f"\nPDF saved to {pdf_filename}")

    except ValueError as e:
        print(Fore.RED + str(e))
    except Exception as e:
        print(Fore.RED + f"Error converting or saving PDF: {e}")

def download_whole_class_gpa():
    try:
        first_roll = input(Fore.CYAN + "Enter the first roll number (FAXX-ABC-000): ")
        last_roll = input(Fore.CYAN + "Enter the last roll number (FAXX-ABC-000): ")
        class_name = input(Fore.CYAN + "Enter the class name to save the PDF: ")

        first_prefix, first_num = first_roll.rsplit('-', 1)
        last_prefix, last_num = last_roll.rsplit('-', 1)

        pattern = r"^FA\d{2}-[A-Z]{3}-\d{3}$"
        if not re.match(pattern, first_roll) or not re.match(pattern, last_roll) or first_prefix != last_prefix:
            raise ValueError("Invalid roll number format or mismatched prefixes.")

        roll_numbers = [f"{first_prefix}-{int(first_num) + i:03d}" for i in range(int(last_num) - int(first_num) + 1)]

        download_and_convert_to_pdf(roll_numbers, class_name)

    except ValueError as e:
        print(Fore.RED + str(e))
    except Exception as e:
        print(Fore.RED + f"Error processing whole class GPA: {e}")

if __name__ == "__main__":
    while True:
        clear_screen()  # Clear the screen at the beginning of each menu iteration
        print_banner()  # Print the banner at the top of the program

        print(Fore.WHITE + "\nMENU:")
        print(Fore.YELLOW + "1. Enter Roll No [FAXX-ABC-000]:")
        print(Fore.YELLOW + "2. Enter First and Last Roll No to get whole class GPA:")
        print(Fore.YELLOW + "3. Exit")
        choice = input(Fore.CYAN + "Enter your choice (1, 2, or 3): ")

        if choice == '1':
            roll_numbers_input = input(Fore.CYAN + "Enter roll numbers separated by commas: ")
            roll_numbers = [roll.strip() for roll in roll_numbers_input.split(',')]
            if len(roll_numbers) > 1:
                pdf_name = input(Fore.CYAN + "Enter the name for the PDF file: ")
            else:
                pdf_name = roll_numbers[0]
            download_and_convert_to_pdf(roll_numbers, pdf_name)
        elif choice == '2':
            download_whole_class_gpa()
        elif choice == '3':
            print(Fore.GREEN + "Exiting program. Goodbye!")
            break
        else:
            print(Fore.RED + "Invalid choice. Please enter 1, 2, or 3.")

        another = input(Fore.MAGENTA + "\nDo you want to return to the menu? (y/n): ")
        if another.lower() != 'y':
            break
