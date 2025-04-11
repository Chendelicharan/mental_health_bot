import streamlit as st
import os
import google.generativeai as genai


genai.configure(api_key="AIzaSyArqv-FQk40tSG5SrpcBit5DB12Qz4Kiuw")
model = genai.GenerativeModel('gemini-2.0-flash')

def role_to_streamlit(role):
    if role == "model":
        return "assistant"
    else:
        return role

if "chat" not in st.session_state:
    st.session_state.chat = model.start_chat(history=[])
    st.session_state.initialized = False  


st.markdown("""
    <h1 style='text-align: center; color: #4CAF50;'>🌱 Mental Wellness Chatbot 🌱</h1>
    <p style='text-align: center;'>Your companion for stress relief and mental well-being.</p>
""", unsafe_allow_html=True)


stress_levels = ["Low", "Moderate", "High"]
energy_levels = ["Low", "Moderate", "High"]

col1, col2 = st.columns(2)
with col1:
    stress = st.selectbox("🌡️ Select your stress level:", stress_levels, key="stress", help="Choose your current stress level.",
                         args=("pointer",))
with col2:
    energy = st.selectbox("⚡ Select your energy level:", energy_levels, key="energy", help="Choose your current energy level.",
                         args=("pointer",))

# Combine user choices with input for conversation
if prompt := st.chat_input("🗨️ How are you feeling today? Describe your thoughts or feelings:"):
    # Display user's last message
    user_input = f"Stress Level: {stress}, Energy Level: {energy}, Message: {prompt}"
    st.chat_message("user").markdown(user_input)

    # Custom prompt for the wellness bot
    wellness_prompt = ("You are a mental wellness assistant bot. Help users manage stress and improve their mental health. "
                       "Ask about their feelings, suggest coping strategies, and offer relaxation tips.")

    if not st.session_state.initialized:
        response = st.session_state.chat.send_message(wellness_prompt)
        st.session_state.initialized = True

    # Send the user entry to Gemini and read the response
    response = st.session_state.chat.send_message(user_input)

    # Display assistant's last message
    with st.chat_message("assistant"):
        st.markdown(response.text)

    # Store the latest response in session state
    st.session_state.response = response
