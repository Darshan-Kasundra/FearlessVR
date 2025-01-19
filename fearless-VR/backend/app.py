from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS  # Import Flask-CORS
import google.generativeai as genai
import os
from gtts import gTTS
from speech_qa_system import generate_question_from_text

# Configure the Gemini API with your API key
genai.configure()

# Create Flask app and SocketIO instance
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes
socketio = SocketIO(app, cors_allowed_origins="*", transports=["websocket"])

# Define text-to-speech function
def text_to_speech(text):
    """Convert text to speech and save it to a file."""
    tts = gTTS(text)
    file_path = "output.mp3"
    tts.save(file_path)
    os.system(f"start {file_path}")  # Use 'start' for Windows, 'open' for macOS, 'mpg123' for Linux

# Define function to generate a single question based on transcription
# def generate_question_from_text():
#     prompt = (
#         f"The following is a transcript of a speech:\n\n"
#         f"{transcription}\n\n"
#         f"Generate one question that could be asked during a Q&A session based on this speech:"
#     )
#     try:
#         model = genai.GenerativeModel("gemini-1.5-flash")  # Ensure the correct model version is used
#         response = model.generate_content(prompt)
        
#         # Extract the response text and return the single question
#         generated_question = response.text.strip()
#         return generated_question
#     except Exception as e:
#         print(f"Error generating question: {e}")
#         return "Error generating question."

# Define routes and event handlers
@app.route("/")
def index():
    return "VR Integration Backend Running"

@socketio.on('get_question')
def handle_get_question(data):
    #transcription = data['transcription']
    question = generate_question_from_text()
    emit('question_generated', {'question': question})

@socketio.on('text_to_speech')
def handle_text_to_speech(data):
    text = data['text']
    text_to_speech(text)  # Call the local text-to-speech function

if __name__ == "__main__":
    socketio.run(app, debug=True)
