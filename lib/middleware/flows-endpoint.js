const express = require('express');
const crypto = require('crypto');
const EncryptionUtils = require('./utils/encryption');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const router = express.Router();

// تحميل المفتاح الخاص
const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, 'keys/private.pem'), 'utf8');
const APP_SECRET = process.env.META_APP_SECRET || process.env.META_ACCESS_TOKEN?.substring(0, 32);

/**
 * نقطة نهاية معالجة طلبات الـ Flow
 * POST /flows/endpoint
 */
router.post('/endpoint', async (req, res) => {
    try {
        console.log('📩 Flow endpoint request received:', new Date().toISOString());
        
        // التحقق من التوقيع (اختياري لكن موصى به)
        const signature = req.headers['x-hub-signature-256'];
        if (signature && APP_SECRET) {
            const rawBody = JSON.stringify(req.body);
            const isValid = EncryptionUtils.verifySignature(rawBody, signature, APP_SECRET);
            
            if (!isValid) {
                console.error('❌ Invalid signature');
                return res.status(401).send('Invalid signature');
            }
            console.log('✅ Signature verified');
        }
        
        const { encrypted_flow_data, encrypted_aes_key, initial_vector } = req.body;
        
        if (!encrypted_flow_data || !encrypted_aes_key || !initial_vector) {
            return res.status(400).send('Missing required fields');
        }
        
        // فك تشفير الطلب
        const { decryptedBody, aesKeyBuffer, ivBuffer } = EncryptionUtils.decryptRequest(
            encrypted_aes_key,
            encrypted_flow_data,
            initial_vector,
            PRIVATE_KEY
        );
        
        console.log('📋 Decrypted request:', JSON.stringify(decryptedBody, null, 2));
        
        // معالجة حسب نوع الإجراء
        const { action, screen, data, version, flow_token } = decryptedBody;
        
        let responseData;
        
        switch (action) {
            case 'INIT':
                // طلب تهيئة عند فتح الـ Flow
                responseData = handleInitAction(screen, data, flow_token);
                break;
                
            case 'data_exchange':
                // طلب تبادل بيانات عند إرسال شاشة
                responseData = handleDataExchangeAction(screen, data, flow_token);
                break;
                
            case 'BACK':
                // طلب عند الضغط على زر الرجوع
                responseData = handleBackAction(screen, data, flow_token);
                break;
                
            default:
                responseData = {
                    screen: screen || 'ERROR',
                    data: {
                        error_message: 'Unknown action'
                    }
                };
        }
        
        // تشفير الرد
        const encryptedResponse = EncryptionUtils.encryptResponse(
            responseData,
            aesKeyBuffer,
            ivBuffer
        );
        
        // إرسال الرد كنص عادي (كما هو مطلوب في الوثائق)
        res.setHeader('Content-Type', 'text/plain');
        res.send(encryptedResponse);
        
        console.log('✅ Response sent successfully');
        
    } catch (error) {
        console.error('❌ Flow endpoint error:', error);
        
        // في حالة خطأ فك التشفير، إرجاع 421
        if (error.message.includes('decrypt')) {
            return res.status(421).send('Decryption failed');
        }
        
        res.status(500).send('Internal server error');
    }
});

/**
 * نقطة نهاية للـ Health Check
 * GET /flows/health
 */
router.get('/health', (req, res) => {
    res.json({
        data: {
            status: 'active',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        }
    });
});

/**
 * نقطة نهاية لرفع المفتاح العام
 * POST /flows/upload-key
 */
router.post('/upload-key', async (req, res) => {
    try {
        const { phoneNumberId } = req.body;
        const accessToken = process.env.META_ACCESS_TOKEN;
        const apiVersion = process.env.META_API_VERSION || 'v24.0';
        
        if (!phoneNumberId) {
            return res.status(400).json({ error: 'phoneNumberId is required' });
        }
        
        // قراءة المفتاح العام
        const publicKeyBase64 = fs.readFileSync(
            path.join(__dirname, 'keys/public_base64.txt'),
            'utf8'
        );
        
        // رفع المفتاح
        const result = await EncryptionUtils.uploadPublicKey(
            phoneNumberId,
            publicKeyBase64,
            accessToken,
            apiVersion
        );
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('❌ Upload key error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * معالجة طلب INIT
 */
function handleInitAction(screen, data, flowToken) {
    console.log('🔄 Handling INIT action for screen:', screen);
    
    // يمكنك هنا تحديد الشاشة الابتدائية بناءً على الـ flow_token
    // أو استخدام الشاشة الافتراضية
    
    return {
        screen: screen || 'APPOINTMENT',
        data: {
            // بيانات الشاشة الابتدائية
            welcome_message: 'مرحباً بك في خدمة حجز المواعيد'
        }
    };
}

/**
 * معالجة طلب data_exchange
 */
function handleDataExchangeAction(screen, data, flowToken) {
    console.log('🔄 Handling DATA_EXCHANGE for screen:', screen);
    console.log('📦 Received data:', data);
    
    // منطق معالجة البيانات حسب الشاشة
    switch (screen) {
        case 'APPOINTMENT':
            return handleAppointmentScreen(data);
            
        case 'DETAILS':
            return handleDetailsScreen(data);
            
        case 'SUMMARY':
            return handleSummaryScreen(data);
            
        default:
            return {
                screen: 'ERROR',
                data: {
                    error_message: 'Invalid screen'
                }
            };
    }
}

/**
 * معالجة شاشة APPOINTMENT
 */
function handleAppointmentScreen(data) {
    const { department, location, date, time } = data;
    
    // التحقق من البيانات
    if (!department) {
        return {
            screen: 'APPOINTMENT',
            data: {
                error_message: 'الرجاء اختيار القسم'
            }
        };
    }
    
    // حفظ البيانات مؤقتاً (يمكن استخدام Redis أو قاعدة بيانات)
    // ...
    
    // الانتقال إلى الشاشة التالية
    return {
        screen: 'DETAILS',
        data: {
            department,
            location,
            date,
            time,
            message: 'الرجاء إدخال بياناتك الشخصية'
        }
    };
}

/**
 * معالجة شاشة DETAILS
 */
function handleDetailsScreen(data) {
    const { name, email, phone, more_details, department, location, date, time } = data;
    
    // التحقق من البيانات المطلوبة
    if (!name || !email || !phone) {
        return {
            screen: 'DETAILS',
            data: {
                error_message: 'الرجاء إدخال جميع البيانات المطلوبة',
                department,
                location,
                date,
                time
            }
        };
    }
    
    // حفظ البيانات في قاعدة البيانات
    const bookingData = {
        department,
        location,
        date,
        time,
        name,
        email,
        phone,
        more_details,
        flow_token: data.flow_token,
        created_at: new Date().toISOString()
    };
    
    // يمكن حفظها في ملف أو قاعدة بيانات
    saveBooking(bookingData);
    
    // إعداد بيانات الملخص
    const appointmentText = `${getDepartmentName(department)} في ${getLocationName(location)}\n${formatDate(date)} الساعة ${time}`;
    const detailsText = `الاسم: ${name}\nالبريد: ${email}\nالهاتف: ${phone}\n${more_details ? 'تفاصيل إضافية: ' + more_details : ''}`;
    
    return {
        screen: 'SUMMARY',
        data: {
            appointment: appointmentText,
            details: detailsText,
            department,
            location,
            date,
            time,
            name,
            email,
            phone,
            more_details
        }
    };
}

/**
 * معالجة شاشة SUMMARY (إنهاء الـ Flow)
 */
function handleSummaryScreen(data) {
    console.log('✅ Flow completed with data:', data);
    
    // يمكن إرسال إشعار أو بريد إلكتروني هنا
    
    // إنهاء الـ Flow بنجاح
    return {
        screen: 'SUCCESS',
        data: {
            extension_message_response: {
                params: {
                    flow_token: data.flow_token,
                    booking_id: generateBookingId(),
                    status: 'confirmed'
                }
            }
        }
    };
}

/**
 * دوال مساعدة
 */
function getDepartmentName(id) {
    const departments = {
        'shopping': 'التسوق والبقالة',
        'clothing': 'الملابس والأزياء',
        'home': 'أدوات منزلية وديكور',
        'electronics': 'إلكترونيات وأجهزة',
        'beauty': 'التجميل والعناية الشخصية'
    };
    return departments[id] || id;
}

function getLocationName(id) {
    const locations = {
        '1': 'كينغز كروس، لندن',
        '2': 'أكسفورد ستريت، لندن',
        '3': 'كوفنت غاردن، لندن',
        '4': 'بيكاديللي سيركس، لندن'
    };
    return locations[id] || id;
}

function formatDate(dateString) {
    const dates = {
        '2024-01-01': 'الإثنين ١ يناير ٢٠٢٤',
        '2024-01-02': 'الثلاثاء ٢ يناير ٢٠٢٤',
        '2024-01-03': 'الأربعاء ٣ يناير ٢٠٢٤'
    };
    return dates[dateString] || dateString;
}

function generateBookingId() {
    return 'BK-' + Date.now().toString(36).toUpperCase() + '-' + 
           Math.random().toString(36).substring(2, 6).toUpperCase();
}

function saveBooking(bookingData) {
    // حفظ في ملف JSON (للبساطة)
    const bookingsFile = path.join(__dirname, 'data/bookings.json');
    let bookings = [];
    
    try {
        if (fs.existsSync(bookingsFile)) {
            bookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading bookings file:', error);
    }
    
    bookings.push(bookingData);
    
    try {
        fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));
        console.log('✅ Booking saved successfully');
    } catch (error) {
        console.error('Error saving booking:', error);
    }
}

module.exports = router;