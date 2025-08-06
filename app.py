from flask import Flask, render_template, request, jsonify, send_file
import requests
import re
from PIL import Image, ImageDraw, ImageFont
import os
import io
import base64
from datetime import datetime

app = Flask(__name__)

def get_gpa_chart(roll_number):
    """Fetch GPA chart image for a given roll number"""
    try:
        # Validate roll number format
        pattern = r"^FA\d{2}-[A-Z]{3}-\d{3}$"
        if not re.match(pattern, roll_number):
            return None, "Invalid roll number format. Please use FAXX-ABC-000"

        # Construct image URL
        image_url = f"https://cms.must.edu.pk:8082/Chartlet/MUST{roll_number}AJK/FanG_Chartlet_GPChart.Jpeg"
        
        # Fetch image
        response = requests.get(image_url, timeout=10)
        if response.status_code == 200:
            return response.content, None
        else:
            # Create a placeholder image if not found
            img = Image.new('RGB', (800, 600), color='white')
            draw = ImageDraw.Draw(img)
            
            # Add text
            font = ImageFont.load_default()
            text = f"GPA Chart for {roll_number}"
            text_width = draw.textlength(text, font=font)
            text_height = 20
            x = (800 - text_width) // 2
            y = 300 - text_height
            
            draw.text((x, y), text, font=font, fill=(0, 0, 0))
            draw.text((350, 320), "Chart not available", font=font, fill=(128, 128, 128))
            
            # Convert to bytes
            img_io = io.BytesIO()
            img.save(img_io, 'JPEG')
            img_io.seek(0)
            return img_io.getvalue(), None
            
    except Exception as e:
        return None, str(e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_gpa', methods=['POST'])
def get_gpa():
    roll_number = request.json.get('roll_number', '').strip()
    
    if not roll_number:
        return jsonify({'error': 'Please enter a roll number'}), 400
    
    image_data, error = get_gpa_chart(roll_number)
    
    if error:
        return jsonify({'error': error}), 400
    
    # Convert to base64 for web display
    image_base64 = base64.b64encode(image_data).decode('utf-8')
    
    return jsonify({
        'success': True,
        'image': image_base64,
        'roll_number': roll_number
    })

@app.route('/download/<roll_number>')
def download(roll_number):
    image_data, error = get_gpa_chart(roll_number)
    
    if error:
        return jsonify({'error': error}), 400
    
    # Create filename
    filename = f"GPA_Chart_{roll_number}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
    
    return send_file(
        io.BytesIO(image_data),
        mimetype='image/jpeg',
        as_attachment=True,
        download_name=filename
    )

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
