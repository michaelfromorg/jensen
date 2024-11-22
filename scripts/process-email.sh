curl -X POST http://localhost:3000/api/process-email \
    -H "Content-Type: application/json" \
    -d "{
        \"threadId\": \"1935172166150949\",
        \"messages\": [
            {
                \"from\": \"Michael DeMarco <michaelfromyeg@gmail.com>\",
                \"subject\": \"Hackathon this Friday\",
                \"body\": \"Don't forget there's a hackathon this weekend. Make sure to think of some ideas!\\n\\n—\\n*Michael DeMarco*\\nBSc Candidate, UBC Computer Science\\n(780) 680-9634\\nmichaeldemar.co\\n\"
            }
        ]
    }"
