// frontend/src/pages/Settings.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx'; 
import * as feather from 'feather-icons';
import { updateProfile } from '../api/authApi.js'; 
import Cropper from 'cropperjs'; 
// NOTE: Cropper.css should be linked in index.html for correct styling.

const Settings = () => {
    const { user, updateUser, isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    // Local form state
    const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
    const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '');
    const [bio, setBio] = useState(user?.bio || ''); 
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    
    // Enhanced Image cropping state
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [cropperReady, setCropperReady] = useState(false);
    const [cropLoading, setCropLoading] = useState(false); // Used for file reading/loading only
    const cropperImageRef = useRef(null); 
    const cropperInstanceRef = useRef(null);
    const fileInputRef = useRef(null);
    const modalInitializedRef = useRef(false);

    // Notification settings state (using mock data from previous version)
    const [notificationSettings, setNotificationSettings] = useState({
        emailLessons: true,
        emailProgress: true,
        emailCommunity: false,
        pushLessons: true,
        pushAchievements: true,
        smsUpdates: false
    });

    // --- Effects & Redirections ---
    
    useEffect(() => {
        if (!isLoggedIn && !loading) {
            navigate('/signin');
        }
    }, [isLoggedIn, loading, navigate]);
    
    // Sync icons and form data on user/tab change
    useEffect(() => {
        feather.replace();
    }, [user, activeTab, isCropModalOpen, alertMessage, notificationSettings]);

    // Cleanup cropper when modal closes
    useEffect(() => {
        if (!isCropModalOpen) {
            if (cropperInstanceRef.current) {
                cropperInstanceRef.current.destroy();
                cropperInstanceRef.current = null;
            }
            // Ensure state reset happens when modal closes
            setCropperReady(false);
            modalInitializedRef.current = false;
        }
    }, [isCropModalOpen]);

    // Initialize cropper when modal opens and image is ready
    useEffect(() => {
        if (isCropModalOpen && imageToCrop && !modalInitializedRef.current) {
            // Give the DOM a small moment to ensure the modal elements are ready
            const timer = setTimeout(() => initializeCropper(), 100); 
            return () => clearTimeout(timer);
        }
    }, [isCropModalOpen, imageToCrop]);

    const initializeCropper = () => {
        const imageElement = cropperImageRef.current;

        if (!imageElement || !imageToCrop) {
            console.error('Cropper initialization failed: No image element or image data');
            showAlert('Failed to load image. Please try again.', 'error');
            return;
        }

        // Destroy existing cropper instance
        if (cropperInstanceRef.current) {
            cropperInstanceRef.current.destroy();
            cropperInstanceRef.current = null;
        }

        // --- Core Fix Logic: Define the instantiation function ---
        const instantiateCropper = () => {
            // Crucial: Clear handlers to prevent memory leaks and redundant calls
            imageElement.onload = null;
            imageElement.onerror = null;

            try {
                const newCropper = new Cropper(imageElement, {
                    aspectRatio: 1,
                    viewMode: 1, // Restrict the crop box to the container
                    dragMode: 'move',
                    autoCropArea: 0.9,
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false,
                    minCropBoxWidth: 100,
                    minCropBoxHeight: 100,
                    preview: '#cropper-preview', // Connect cropper preview to the styled area
                    ready: function() {
                        console.log('Cropper ready!');
                        setCropperReady(true); // FIX: This resolves the loading screen
                        modalInitializedRef.current = true;
                    },
                });
                cropperInstanceRef.current = newCropper;
            } catch (error) {
                console.error('Failed to create cropper instance:', error);
                showAlert('Failed to initialize image editor.', 'error');
                setCropperReady(false);
            }
        };

        // FIX: Check if the image has completed loading or attach a listener
        if (imageElement.complete && imageElement.naturalHeight !== 0) {
            console.log('Image already loaded, initializing cropper immediately');
            instantiateCropper();
        } else {
            console.log('Attaching onload listener to image element.');
            imageElement.onload = instantiateCropper;
            imageElement.onerror = () => {
                showAlert('Image file failed to load. Try a different file.', 'error');
                cancelCrop();
            };
            
            // OPTIONAL: Safety timeout (can help diagnose issues but rely mainly on onload)
            setTimeout(() => {
                if (!cropperReady && !cropperInstanceRef.current) {
                    console.log('Timeout: Attempting final forced initialization.');
                    if(isCropModalOpen) {
                        instantiateCropper(); 
                    }
                }
            }, 3000); 
        }
    };
    
    // --- Utility Functions ---
    const showAlert = (message, type = 'success') => {
        setAlertMessage({ message, type });
        setTimeout(() => setAlertMessage(null), 5000);
    };

    const handlePhotoChange = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Reset previous state
        setCropperReady(false);
        modalInitializedRef.current = false;
        setCropLoading(true);

        // Enhanced file validation
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showAlert('Photo upload failed: File size exceeds 5MB.', 'error');
            event.target.value = '';
            setCropLoading(false);
            return;
        }

        if (!file.type.startsWith('image/')) {
            showAlert('Please select a valid image file (JPEG, PNG, or WebP).', 'error');
            event.target.value = '';
            setCropLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => { 
            setImageToCrop(e.target.result); 
            setIsCropModalOpen(true); 
            setCropLoading(false);
        };
        reader.onerror = () => {
            showAlert('Failed to read the image file. Please try again.', 'error');
            event.target.value = '';
            setCropLoading(false);
        };
        reader.readAsDataURL(file); 
        event.target.value = ''; 
    };
    
    const cancelCrop = () => {
        console.log('Canceling crop...');
        
        // Cleanup handled by the useEffect hook
        setIsCropModalOpen(false);
        setImageToCrop(null);
        setCropperReady(false);
        setCropLoading(false);
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const applyCrop = async () => {
        console.log('Applying crop, ready:', cropperReady, 'instance:', cropperInstanceRef.current);
        
        if (!cropperInstanceRef.current || !cropperReady) {
            showAlert('Image editor is not ready. Please wait for the image to load completely.', 'error');
            return;
        }

        setLoading(true); // Start general loading for API call/submission

        try {
            // Get cropped canvas with optimal settings for a profile picture
            const croppedCanvas = cropperInstanceRef.current.getCroppedCanvas({
                width: 512,
                height: 512,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
                fillColor: '#fff'
            });

            if (!croppedCanvas) {
                throw new Error('Failed to process image. Please try again.');
            }

            // Convert Canvas output to a Blob/File for FormData
            const imageBlob = await new Promise((resolve, reject) => {
                croppedCanvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create image file.'));
                    }
                }, 'image/jpeg', 0.92); // Convert to JPEG with 92% quality
            });

            // Create FormData object to send both text fields and the file
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('bio', bio);
            // Append the Blob as a file under the name 'profilePicture' (matches backend Multer field name)
            formData.append('profilePicture', imageBlob, 'profile.jpg'); 

            // Update profile via API (sends FormData)
            const apiResponse = await updateProfile(formData);

            // The backend sends back the updated user object, including the new URL
            updateUser({ 
                ...user, 
                ...apiResponse.user
            }); 
            
            showAlert('Profile picture updated successfully!');
            
            // Close modal and cleanup
            cancelCrop();
            
        } catch (error) {
            console.error('Crop application error:', error);
            // Crucial: Ensure the error message is extracted correctly
            showAlert(error.message || 'Failed to update profile picture. Please try again.', 'error');
        } finally {
            // **FIX**: Ensure loading state is reliably reset
            setLoading(false); 
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault(); 
        if (!user) return logout();

        setLoading(true);
        setAlertMessage(null);
        
        if (!firstName || !lastName) {
            showAlert('Full Name cannot be empty.', 'error');
            setLoading(false);
            return;
        }

        try {
            // Send text fields as a regular object (updateProfile handles JSON conversion)
            const payload = { 
                firstName: firstName, 
                lastName: lastName, 
                bio: bio,
            };
            
            const apiResponse = await updateProfile(payload);
            
            // Update global context
            updateUser({ 
                ...user, 
                name: `${firstName} ${lastName}`.trim(), 
                bio: bio,
                ...apiResponse.user, 
            }); 
            
            showAlert('Profile information updated successfully!');
        } catch (error) {
            showAlert(error.message || 'Failed to update profile.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Simulate API call
            // In a real app, you would send notificationSettings object to a PUT /api/notifications route
            await new Promise(resolve => setTimeout(resolve, 1000));
            showAlert('Notification preferences updated successfully!');
        } catch (error) {
            showAlert('Failed to update notification settings.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationChange = (setting) => {
        setNotificationSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };
    
    const getInitials = useCallback(() => {
        const fullName = user?.name || 'User';
        const parts = fullName.split(' ');
        if (parts.length > 1) {
            return parts.map(n => n[0]).join('').toUpperCase().substring(0, 2);
        }
        return fullName.charAt(0).toUpperCase();
    }, [user]);

    const renderProfilePicture = () => {
        const initials = getInitials();
        if (user?.photoUrl) {
            return (
                <img 
                    src={user.photoUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.target.style.display = 'none';
                        const fallback = e.target.nextSibling;
                        if (fallback) fallback.style.display = 'flex';
                    }}
                />
            );
        }
        return (
            <span className="flex items-center justify-center text-3xl font-bold text-primary-400">
                {initials}
            </span>
        );
    };
    
    if (!user) return null;

    return (
        <div className="flex flex-col min-h-screen dark-gradient-secondary">
            {/* Hidden File Input */}
            <input 
                ref={fileInputRef}
                type="file" 
                id="file-input" 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                className="hidden" 
                onChange={handleFileInputChange}
            />
            
            <main className="flex-grow py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center mb-6">
                        <button onClick={() => navigate(-1)} id="back-button" className="mr-3 p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center">
                            <i data-feather="arrow-left" className="w-5 h-5 text-gray-400"></i>
                        </button>
                        <h1 className="text-3xl font-extrabold text-white flex items-center">
                            <i data-feather="settings" className="w-8 h-8 mr-3 text-primary-500"></i> Account Settings
                        </h1>
                    </div>
                    
                    <div className="dark-glass shadow-xl rounded-xl overflow-hidden border border-gray-700">
                        {/* Navigation Tabs */}
                        <div className="border-b border-gray-700">
                            <nav className="-mb-px flex space-x-8 px-6 pt-4" aria-label="Tabs">
                                <button 
                                    onClick={() => setActiveTab('profile')} 
                                    className={`tab-link whitespace-nowrap py-3 px-1 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                                        activeTab === 'profile' 
                                            ? 'active text-primary-400 border-b-2 border-primary-500' 
                                            : 'text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-600'
                                    }`}
                                >
                                    <i data-feather="user" className="w-4 h-4 inline-block mr-2"></i> Profile
                                </button>
                                <button 
                                    onClick={() => setActiveTab('notifications')} 
                                    className={`tab-link whitespace-nowrap py-3 px-1 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                                        activeTab === 'notifications' 
                                            ? 'active text-primary-400 border-b-2 border-primary-500' 
                                            : 'text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-600'
                                    }`}
                                >
                                    <i data-feather="bell" className="w-4 h-4 inline-block mr-2"></i> Notifications
                                </button>
                            </nav>
                        </div>

                        <div className="p-6 sm:p-8">
                            {/* Alert Modal Placeholder */}
                            {alertMessage && (
                                <div className={`p-4 mb-6 rounded-lg shadow-md border ${
                                    alertMessage.type === 'error' 
                                        ? 'bg-red-500/20 border-red-500 text-red-100' 
                                        : 'bg-primary-500/20 border-primary-500 text-primary-100'
                                }`}>
                                    <div className="flex items-center">
                                        <i data-feather={alertMessage.type === 'error' ? 'alert-triangle' : 'check-circle'} className="w-5 h-5 mr-3"></i>
                                        <p className="text-sm font-medium">{alertMessage.message}</p>
                                    </div>
                                </div>
                            )}

                            {/* Profile Tab Content */}
                            <div id="content-profile" className={`tab-content ${activeTab !== 'profile' ? 'hidden' : ''}`}>
                                <h2 className="text-2xl font-semibold text-white mb-6">Update Profile Information</h2>
                                
                                <div className="flex flex-col lg:flex-row lg:space-x-8">
                                    {/* Left Side: Profile Picture */}
                                    <div className="lg:w-1/4 mb-6 lg:mb-0">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
                                        <div className="flex flex-col items-center space-y-3">
                                            <div 
                                                id="profile-picture-container" 
                                                className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center text-primary-400 text-3xl font-bold border-4 border-primary-500/50 shadow-md overflow-hidden flex-shrink-0 cursor-pointer hover:border-primary-500 transition duration-200"
                                            >
                                                {renderProfilePicture()}
                                            </div>
                                            <button 
                                                type="button" 
                                                id="change-photo-button" 
                                                onClick={handlePhotoChange}
                                                disabled={loading}
                                                className="dark-btn-secondary px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50"
                                            >
                                                {cropLoading ? (
                                                    <span className="flex items-center">
                                                        <i data-feather="loader" className="animate-spin mr-2 h-4 w-4"></i> Loading...
                                                    </span>
                                                ) : (
                                                    'Change Photo'
                                                )}
                                            </button>
                                            <p className="mt-1 text-xs text-gray-500">JPG, PNG or WebP no larger than 5MB</p>
                                        </div>
                                    </div>

                                    {/* Right Side: Form */}
                                    <div className="lg:w-3/4">
                                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                                            {/* Full Name */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">First Name</label>
                                                    <input 
                                                        type="text" 
                                                        id="firstName" 
                                                        value={firstName} 
                                                        onChange={(e) => setFirstName(e.target.value)} 
                                                        placeholder="Coder" 
                                                        className="form-input mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-white"
                                                        disabled={loading}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">Last Name</label>
                                                    <input 
                                                        type="text" 
                                                        id="lastName" 
                                                        value={lastName} 
                                                        onChange={(e) => setLastName(e.target.value)} 
                                                        placeholder="User" 
                                                        className="form-input mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-white"
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Email */}
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                                                <input 
                                                    type="email" 
                                                    id="email" 
                                                    value={user.email} 
                                                    className="form-input mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700/50 text-gray-400" 
                                                    disabled
                                                />
                                                <p className="mt-1 text-xs text-gray-500">Your registered email address (cannot be changed)</p>
                                            </div>
                                            
                                            {/* Bio */}
                                            <div>
                                                <label htmlFor="bio" className="block text-sm font-medium text-gray-300">Bio</label>
                                                <textarea 
                                                    id="bio" 
                                                    value={bio} 
                                                    onChange={(e) => setBio(e.target.value)}
                                                    rows="3" 
                                                    placeholder="I am a passionate coder learning data structures and web development." 
                                                    className="form-input mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 bg-gray-700 text-white"
                                                    disabled={loading}
                                                ></textarea>
                                            </div>
                                            
                                            {/* Save Button */}
                                            <div className="pt-4 border-t border-gray-700">
                                                <button 
                                                    type="submit" 
                                                    id="save-profile-button" 
                                                    disabled={loading} 
                                                    className="dark-btn inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white transition-colors duration-200 disabled:opacity-50"
                                                >
                                                    {loading ? (
                                                        <span className="flex items-center">
                                                            <i data-feather="loader" className="animate-spin mr-2 h-4 w-4"></i> Saving...
                                                        </span>
                                                    ) : (
                                                        'Save Changes'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Notifications Tab Content */}
                            <div id="content-notifications" className={`tab-content ${activeTab !== 'notifications' ? 'hidden' : ''}`}>
                                <div className="flex flex-col lg:flex-row lg:space-x-8">
                                    <div className="lg:w-3/4">
                                        <h2 className="text-2xl font-semibold text-white mb-6">Notification Preferences</h2>
                                        <p className="text-gray-400 mb-8">Manage how you receive notifications and updates from our platform.</p>
                                        
                                        <form onSubmit={handleNotificationUpdate} className="space-y-8">
                                            {/* Email Notifications Section */}
                                            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                                <div className="flex items-center mb-6">
                                                    <div className="bg-blue-500/20 p-3 rounded-lg mr-4">
                                                        <i data-feather="mail" className="w-6 h-6 text-blue-400"></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white">Email Notifications</h3>
                                                        <p className="text-gray-400 text-sm">Receive updates via email</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    {/* FIX: Using new notification-row-bg class */}
                                                    <div className="flex items-center justify-between p-4 notification-row-bg rounded-lg hover:notification-row-hover transition-colors duration-200">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="bg-blue-500/10 p-2 rounded">
                                                                <i data-feather="book-open" className="w-4 h-4 text-blue-400"></i>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="email-lessons" className="font-medium text-gray-300 cursor-pointer">New Lesson Releases</label>
                                                                <p className="text-gray-500 text-sm mt-1">Get notified when new interactive lessons are published</p>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <input 
                                                                id="email-lessons" 
                                                                name="email-lessons" 
                                                                type="checkbox" 
                                                                checked={notificationSettings.emailLessons}
                                                                onChange={() => handleNotificationChange('emailLessons')}
                                                                className="sr-only" 
                                                            />
                                                            <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                                                                notificationSettings.emailLessons ? 'bg-blue-500' : 'bg-gray-600'
                                                            }`}>
                                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                                                    notificationSettings.emailLessons ? 'translate-x-6' : 'translate-x-0'
                                                                }`}></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* FIX: Using new notification-row-bg class */}
                                                    <div className="flex items-center justify-between p-4 notification-row-bg rounded-lg hover:notification-row-hover transition-colors duration-200">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="bg-green-500/10 p-2 rounded">
                                                                <i data-feather="trending-up" className="w-4 h-4 text-green-400"></i>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="email-progress" className="font-medium text-gray-300 cursor-pointer">Weekly Progress Report</label>
                                                                <p className="text-gray-500 text-sm mt-1">Receive a summary of your coding progress and learning streaks</p>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <input 
                                                                id="email-progress" 
                                                                name="email-progress" 
                                                                type="checkbox" 
                                                                checked={notificationSettings.emailProgress}
                                                                onChange={() => handleNotificationChange('emailProgress')}
                                                                className="sr-only" 
                                                            />
                                                            <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                                                                notificationSettings.emailProgress ? 'bg-green-500' : 'bg-gray-600'
                                                            }`}>
                                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                                                    notificationSettings.emailProgress ? 'translate-x-6' : 'translate-x-0'
                                                                }`}></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* FIX: Using new notification-row-bg class */}
                                                    <div className="flex items-center justify-between p-4 notification-row-bg rounded-lg hover:notification-row-hover transition-colors duration-200">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="bg-purple-500/10 p-2 rounded">
                                                                <i data-feather="users" className="w-4 h-4 text-purple-400"></i>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="email-community" className="font-medium text-gray-300 cursor-pointer">Community Activity</label>
                                                                <p className="text-gray-500 text-sm mt-1">Get updates on replies to your forum posts and events</p>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <input 
                                                                id="email-community" 
                                                                name="email-community" 
                                                                type="checkbox" 
                                                                checked={notificationSettings.emailCommunity}
                                                                onChange={() => handleNotificationChange('emailCommunity')}
                                                                className="sr-only" 
                                                            />
                                                            <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                                                                notificationSettings.emailCommunity ? 'bg-purple-500' : 'bg-gray-600'
                                                            }`}>
                                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                                                    notificationSettings.emailCommunity ? 'translate-x-6' : 'translate-x-0'
                                                            }`}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Push Notifications Section */}
                                            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                                <div className="flex items-center mb-6">
                                                    <div className="bg-orange-500/20 p-3 rounded-lg mr-4">
                                                        <i data-feather="smartphone" className="w-6 h-6 text-orange-400"></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white">Push Notifications</h3>
                                                        <p className="text-gray-400 text-sm">Receive browser and mobile notifications</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    {/* FIX: Using new notification-row-bg class */}
                                                    <div className="flex items-center justify-between p-4 notification-row-bg rounded-lg hover:notification-row-hover transition-colors duration-200">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="bg-orange-500/10 p-2 rounded">
                                                                <i data-feather="book" className="w-4 h-4 text-orange-400"></i>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="push-lessons" className="font-medium text-gray-300 cursor-pointer">New Lessons & Updates</label>
                                                                <p className="text-gray-500 text-sm mt-1">Get real-time notifications about new content</p>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <input 
                                                                id="push-lessons" 
                                                                name="push-lessons" 
                                                                type="checkbox" 
                                                                checked={notificationSettings.pushLessons}
                                                                onChange={() => handleNotificationChange('pushLessons')}
                                                                className="sr-only" 
                                                            />
                                                            <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                                                                notificationSettings.pushLessons ? 'bg-orange-500' : 'bg-gray-600'
                                                            }`}>
                                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                                                    notificationSettings.pushLessons ? 'translate-x-6' : 'translate-x-0'
                                                            }`}></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* FIX: Using new notification-row-bg class */}
                                                    <div className="flex items-center justify-between p-4 notification-row-bg rounded-lg hover:notification-row-hover transition-colors duration-200">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="bg-yellow-500/10 p-2 rounded">
                                                                <i data-feather="award" className="w-4 h-4 text-yellow-400"></i>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="push-achievements" className="font-medium text-gray-300 cursor-pointer">Achievements & Milestones</label>
                                                                <p className="text-gray-500 text-sm mt-1">Celebrate your coding achievements and progress</p>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <input 
                                                                id="push-achievements" 
                                                                name="push-achievements" 
                                                                type="checkbox" 
                                                                checked={notificationSettings.pushAchievements}
                                                                onChange={() => handleNotificationChange('pushAchievements')}
                                                                className="sr-only" 
                                                            />
                                                            <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                                                                notificationSettings.pushAchievements ? 'bg-yellow-500' : 'bg-gray-600'
                                                            }`}>
                                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                                                    notificationSettings.pushAchievements ? 'translate-x-6' : 'translate-x-0'
                                                            }`}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SMS Notifications Section */}
                                            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                                <div className="flex items-center mb-6">
                                                    <div className="bg-red-500/20 p-3 rounded-lg mr-4">
                                                        <i data-feather="message-circle" className="w-6 h-6 text-red-400"></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white">SMS Notifications</h3>
                                                        <p className="text-gray-400 text-sm">Receive text message updates (standard rates may apply)</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    {/* FIX: Using new notification-row-bg class */}
                                                    <div className="flex items-center justify-between p-4 notification-row-bg rounded-lg hover:notification-row-hover transition-colors duration-200">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="bg-red-500/10 p-2 rounded">
                                                                <i data-feather="alert-circle" className="w-4 h-4 text-red-400"></i>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="sms-updates" className="font-medium text-gray-300 cursor-pointer">Important Updates</label>
                                                                <p className="text-gray-500 text-sm mt-1">Critical platform updates and security alerts</p>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <input 
                                                                id="sms-updates" 
                                                                name="sms-updates" 
                                                                type="checkbox" 
                                                                checked={notificationSettings.smsUpdates}
                                                                onChange={() => handleNotificationChange('smsUpdates')}
                                                                className="sr-only" 
                                                            />
                                                            <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                                                                notificationSettings.smsUpdates ? 'bg-red-500' : 'bg-gray-600'
                                                            }`}>
                                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                                                    notificationSettings.smsUpdates ? 'translate-x-6' : 'translate-x-0'
                                                            }`}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-700">
                                                <button 
                                                    type="submit" 
                                                    disabled={loading}
                                                    className="dark-btn inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white transition-colors duration-200 disabled:opacity-50"
                                                >
                                                    {loading ? (
                                                        <span className="flex items-center">
                                                            <i data-feather="loader" className="animate-spin mr-2 h-4 w-4"></i> Saving Preferences...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center">
                                                            <i data-feather="save" className="mr-2 h-4 w-4"></i>
                                                            Save Notification Settings
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Notification Tips Sidebar */}
                                    <div className="lg:w-1/4 mt-8 lg:mt-0">
                                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                                                <i data-feather="info" className="w-5 h-5 mr-2 text-primary-400"></i>
                                                Notification Tips
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex items-start space-x-3">
                                                    <i data-feather="bell" className="w-4 h-4 text-green-400 mt-1 flex-shrink-0"></i>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-300">Stay Updated</p>
                                                        <p className="text-xs text-gray-500 mt-1">Enable notifications to never miss important updates</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-3">
                                                    <i data-feather="zap" className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0"></i>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-300">Real-time Alerts</p>
                                                        <p className="text-xs text-gray-500 mt-1">Get instant notifications for time-sensitive content</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-3">
                                                    <i data-feather="settings" className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0"></i>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-300">Customizable</p>
                                                        <p className="text-xs text-gray-500 mt-1">Adjust settings anytime to match your preferences</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* --- Enhanced Cropper Modal --- */}
            <div id="crop-modal" className={`fixed inset-0 ${isCropModalOpen ? 'flex' : 'hidden'} items-center justify-center p-4 z-50`} style={{backgroundColor: 'rgba(0, 0, 0, 0.95)'}}>
                <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl border border-gray-600 max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900 rounded-t-xl">
                        <div>
                            <h3 className="text-xl font-bold text-white">Edit Profile Picture</h3>
                            <p className="text-sm text-gray-400 mt-1">
                                {cropperReady ? 'Drag to position and use handles to crop' : 'Loading image editor...'}
                            </p>
                        </div>
                        <button 
                            type="button" 
                            onClick={cancelCrop} 
                            className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-gray-700 rounded-lg"
                            disabled={loading}
                        >
                            <i data-feather="x" className="w-6 h-6"></i>
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex-grow overflow-auto">
                        <div className="flex flex-col xl:flex-row gap-8">
                            {/* Enhanced Cropper Area */}
                            <div className="xl:w-2/3">
                                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-white">Crop Image</h4>
                                        {cropperReady ? (
                                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                <div className="flex items-center space-x-1">
                                                    <i data-feather="move" className="w-4 h-4"></i>
                                                    <span>Drag to move</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <i data-feather="maximize-2" className="w-4 h-4"></i>
                                                    <span>Handles to resize</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2 text-sm text-primary-400">
                                                <i data-feather="loader" className="w-4 h-4 animate-spin"></i>
                                                <span>Initializing editor...</span>
                                            </div>
                                        )}
                                    </div>
                                    <div 
                                        id="cropper-container" 
                                        className="h-96 w-full flex items-center justify-center bg-gray-800 rounded border-2 border-dashed border-gray-600 overflow-hidden relative min-h-[400px]"
                                    >
                                        {/* The loading overlay is now conditionally rendered based on cropperReady */}
                                        {!cropperReady && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 z-10">
                                                <div className="text-center">
                                                    <i data-feather="loader" className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2"></i>
                                                    <p className="text-gray-400 text-sm">Loading image editor...</p>
                                                    <p className="text-gray-500 text-xs mt-1">This may take a moment for large images</p>
                                                </div>
                                            </div>
                                        )}
                                        {imageToCrop && (
                                            <img 
                                                id="image-to-crop" 
                                                ref={cropperImageRef} 
                                                src={imageToCrop} 
                                                alt="Image to crop" 
                                                className="max-w-full max-h-full"
                                                style={{ display: 'block', maxWidth: '100%' }}
                                                crossOrigin="anonymous"
                                            />
                                        )}
                                    </div>
                                    {cropperReady && (
                                        <div className="mt-4 flex justify-center space-x-4">
                                            <button 
                                                type="button"
                                                onClick={() => cropperInstanceRef.current && cropperInstanceRef.current.zoom(0.1)}
                                                className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
                                            >
                                                <i data-feather="zoom-in" className="w-3 h-3 mr-1 inline"></i>
                                                Zoom In
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => cropperInstanceRef.current && cropperInstanceRef.current.zoom(-0.1)}
                                                className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
                                            >
                                                <i data-feather="zoom-out" className="w-3 h-3 mr-1 inline"></i>
                                                Zoom Out
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => cropperInstanceRef.current && cropperInstanceRef.current.reset()}
                                                className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
                                            >
                                                <i data-feather="refresh-cw" className="w-3 h-3 mr-1 inline"></i>
                                                Reset
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Enhanced Preview & Controls */}
                            <div className="xl:w-1/3">
                                <div className="space-y-6">
                                    {/* Enhanced Preview */}
                                    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
                                        <h4 className="text-lg font-semibold text-white mb-4 text-center">Preview</h4>
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="relative">
                                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 p-1 shadow-lg">
                                                    <div id="cropper-preview" className="w-full h-full rounded-full overflow-hidden bg-gray-800 border-2 border-white/20 flex items-center justify-center">
                                                        {!cropperReady && (
                                                            <span className="text-gray-400 text-sm">Preview will appear here</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 bg-primary-500 rounded-full p-2 shadow-lg">
                                                    <i data-feather="user" className="w-4 h-4 text-white"></i>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-300">Your profile picture</p>
                                                <p className="text-xs text-gray-500 mt-1">Will appear as a circle across the platform</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Instructions */}
                                    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                                        <h5 className="font-medium text-white mb-3 flex items-center">
                                            <i data-feather="info" className="w-4 h-4 mr-2 text-primary-400"></i>
                                            Tips for best results
                                        </h5>
                                        <ul className="text-xs text-gray-400 space-y-2">
                                            <li className="flex items-start">
                                                <i data-feather="check-circle" className="w-3 h-3 mr-2 text-green-400 mt-0.5 flex-shrink-0"></i>
                                                <span>Center your face in the square for best appearance</span>
                                            </li>
                                            <li className="flex items-start">
                                                <i data-feather="check-circle" className="w-3 h-3 mr-2 text-green-400 mt-0.5 flex-shrink-0"></i>
                                                <span>Use good lighting for clear, high-quality photos</span>
                                            </li>
                                            <li className="flex items-start">
                                                <i data-feather="check-circle" className="w-3 h-3 mr-2 text-green-400 mt-0.5 flex-shrink-0"></i>
                                                <span>High-resolution images work best for cropping</span>
                                            </li>
                                            <li className="flex items-start">
                                                <i data-feather="check-circle" className="w-3 h-3 mr-2 text-green-400 mt=0.5 flex-shrink-0"></i>
                                                <span>Use zoom controls for precise adjustments</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Image Quality Info */}
                                    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                                        <h5 className="font-medium text-white mb-2 flex items-center">
                                            <i data-feather="award" className="w-4 h-4 mr-2 text-yellow-400"></i>
                                            Image Quality
                                        </h5>
                                        <div className="text-xs text-gray-400 space-y-1">
                                            <p>Output: 512×512 pixels</p>
                                            <p>Format: High-quality JPEG</p>
                                            <p>Optimized for web use</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Enhanced Footer Actions */}
                    <div className="p-6 border-t border-gray-700 bg-gray-900 rounded-b-xl">
                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                            <div className="text-sm text-gray-400 flex items-center">
                                <i data-feather="shield" className="w-4 h-4 mr-2"></i>
                                Your photo is only visible to you and platform administrators
                            </div>
                            <div className="flex space-x-3">
                                <button 
                                    type="button" 
                                    onClick={cancelCrop} 
                                    disabled={loading}
                                    className="px-6 py-3 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors duration-200 flex items-center disabled:opacity-50"
                                >
                                    <i data-feather="x" className="w-4 h-4 mr-2"></i>
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    onClick={applyCrop} 
                                    disabled={loading || !cropperReady}
                                    className="dark-btn px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white transition-colors duration-200 disabled:opacity-50 flex items-center min-w-[140px] justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <i data-feather="loader" className="animate-spin mr-2 w-4 h-4"></i>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i data-feather="check" className="w-4 h-4 mr-2"></i>
                                            Apply Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;