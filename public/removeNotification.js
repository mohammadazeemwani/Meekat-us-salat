

disableNotificationBtn.addEventListener('click', () => {
    
    fetch('/disableNotification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fcm_token: localStorage.getItem('fcm_token'),
            districtHash: localStorage.getItem('districtHash'),
            indexOfBatch: localStorage.getItem('indexOfBatch'),
            indexOfFcmInBatch: localStorage.getItem('indexOfFcmInBatch'),
        })
    }).then(response => {
            if (response.ok) {
                localStorage.setItem('notificationEnabled', false);
                window.location.href = '/';
            }
        })
})