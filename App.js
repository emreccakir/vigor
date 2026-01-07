import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  SafeAreaView, Keyboard, TouchableWithoutFeedback, Modal, Alert, ActivityIndicator, StatusBar, FlatList, ScrollView, Image, LayoutAnimation, Platform, UIManager 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons'; 

// --- ANDROID İÇİN ANİMASYONU AKTİF ET ---
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- GLITCH ÖNLEYİCİ ANİMASYON AYARI ---
// Update (hareket) animasyonunu sildik, sadece Create ve Delete (fade) bıraktık.
const ScreenTransition = {
  duration: 400,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

// --- RENKLER ---
const COLORS = {
  login: {
    bg: '#a2b2ddff',           
    logoText: '#1909adde',     
    subText: '#6d6b6bff',      
    cardBg: '#ffffff',         
    primary: '#1909adde',      
    text: '#ffffff'            
  },
  dashboard: {
    bg: '#caecf7ff',             
    headerText: '#02081aff',     
    subText: '#e74c3c',        
    
    // Kalan Kalori Kartı
    card1Bg: '#1f3b8ade',      
    card1Title: 'rgba(255,255,255,0.8)',
    card1Value: '#ffffff',
    
    // Su Kartı
    card2Bg: '#3498db',        
    card2Title: '#ffffff',
    
    // Listeler ve Butonlar
    sectionTitle: '#2c3e50',   
    addButtonBg: '#27ae60',    // YEŞİL (Referans Rengimiz)
    addButtonText: '#ffffff',
    
    // Öneri Kartları
    suggestionBg: '#bde4fdff', 
    suggestionBorder: '#2a58bdff',
    suggestionText: '#d35400'
  },

  // GENEL RENKLER
  white: '#ffffff',
  danger: '#e74c3c',
  success: '#27ae60',
  localBadge: '#e67e22',
  marketBadge: '#2980b9'
};

const AVATAR_COLORS = ['#3498db', '#f1c40f', '#e74c3c', '#2ecc71', '#9b59b6'];

// --- LOKAL VERİTABANI ---
const LOCAL_FOODS = [
  { id: 'tr1', name: 'Haşlanmış Yumurta', calories: 75, protein: 6, baseGrams: 50, unit: '1 adet', portionGrams: { tabak: 100, avuc: 100 }, isHealthy: true },
  { id: 'tr2', name: 'Sahanda Yumurta (Yağlı)', calories: 110, protein: 6, baseGrams: 55, unit: '1 adet', isHealthy: true },
  { id: 'tr3', name: 'Simit', calories: 320, protein: 10, baseGrams: 100, unit: '1 adet', isHealthy: false },
  { id: 'tr4', name: 'Beyaz Peynir', calories: 95, protein: 6, baseGrams: 30, unit: '1 dilim (30g)', portionGrams: { kibrit: 30, tabak: 100, kasik: 15 }, isHealthy: true },
  { id: 'tr5', name: 'Kaşar Peyniri', calories: 110, protein: 8, baseGrams: 30, unit: '1 dilim (30g)', portionGrams: { kibrit: 30, tost: 40, avuc: 50 }, isHealthy: true },
  { id: 'tr6', name: 'Zeytin', calories: 45, protein: 0.5, baseGrams: 20, unit: '5 adet', portionGrams: { avuc: 40, kase: 100, kasik: 15 }, isHealthy: true },
  { id: 'tr7', name: 'Bal', calories: 60, protein: 0, baseGrams: 20, unit: '1 tatlı kaşığı', portionGrams: { kasik: 15, bardak: 300 }, isHealthy: true },
  { id: 'tr8', name: 'Tereyağı', calories: 75, protein: 0, baseGrams: 15, unit: '1 tatlı kaşığı', portionGrams: { kasik: 15, kibrit: 20 }, isHealthy: false },
  { id: 'tr9', name: 'Sucuklu Yumurta', calories: 250, protein: 15, baseGrams: 150, unit: '1 porsiyon', portionGrams: { tabak: 200 }, isHealthy: false },
  { id: 'tr10', name: 'Menemen', calories: 180, protein: 8, baseGrams: 200, unit: '1 porsiyon', portionGrams: { tabak: 300, kasik: 20 }, isHealthy: true },
  { id: 'tr11', name: 'Poğaça', calories: 280, protein: 8, baseGrams: 90, unit: '1 adet', isHealthy: false },
  { id: 'tr12', name: 'Açma', calories: 300, protein: 7, baseGrams: 100, unit: '1 adet', isHealthy: false },
  { id: 'tr13', name: 'Lahmacun', calories: 220, protein: 10, baseGrams: 120, unit: '1 adet', isHealthy: false },
  { id: 'tr14', name: 'Adana Kebap', calories: 360, protein: 18, baseGrams: 150, unit: '1 porsiyon', isHealthy: false },
  { id: 'tr15', name: 'İskender Kebap', calories: 750, protein: 35, baseGrams: 400, unit: '1 porsiyon', isHealthy: false },
  { id: 'tr16', name: 'Kuru Fasulye', calories: 340, protein: 22, baseGrams: 300, unit: '1 porsiyon', portionGrams: { kasik: 20, tabak: 300, kase: 250 }, isHealthy: true },
  { id: 'tr17', name: 'Pilav (Pirinç)', calories: 360, protein: 6, baseGrams: 200, unit: '1 porsiyon', portionGrams: { kasik: 20, tabak: 250, kase: 200 }, isHealthy: false },
  { id: 'tr18', name: 'Pilav (Bulgur)', calories: 290, protein: 9, baseGrams: 200, unit: '1 porsiyon', portionGrams: { kasik: 20, tabak: 250, kase: 200 }, isHealthy: true },
  { id: 'tr19', name: 'Mantı', calories: 400, protein: 12, baseGrams: 250, unit: '1 porsiyon', portionGrams: { tabak: 300, kasik: 15 }, isHealthy: false },
  { id: 'tr20', name: 'Karnıyarık', calories: 270, protein: 10, baseGrams: 200, unit: '1 adet', isHealthy: true },
  { id: 'tr21', name: 'Tavuk Sote', calories: 220, protein: 25, baseGrams: 200, unit: '1 porsiyon', portionGrams: { tabak: 250, kasik: 30 }, isHealthy: true },
  { id: 'tr22', name: 'Izgara Köfte', calories: 320, protein: 20, baseGrams: 150, unit: '1 porsiyon', isHealthy: true },
  { id: 'tr23', name: 'Döner (Ekmek Arası)', calories: 550, protein: 25, baseGrams: 250, unit: '1 adet', isHealthy: false },
  { id: 'tr24', name: 'Çiğ Köfte (Dürüm)', calories: 360, protein: 10, baseGrams: 150, unit: '1 adet', isHealthy: false },
  { id: 'tr25', name: 'Mercimek Çorbası', calories: 130, protein: 7, baseGrams: 250, unit: '1 kase', portionGrams: { kase: 250, bardak: 200, kasik: 10 }, isHealthy: true },
  { id: 'tr26', name: 'Tarhana Çorbası', calories: 150, protein: 6, baseGrams: 250, unit: '1 kase', portionGrams: { kase: 250, bardak: 200, kasik: 10 }, isHealthy: true },
  { id: 'tr27', name: 'Ezogelin Çorbası', calories: 140, protein: 5, baseGrams: 250, unit: '1 kase', portionGrams: { kase: 250, bardak: 200, kasik: 10 }, isHealthy: true },
  { id: 'tr28', name: 'Taze Fasulye', calories: 150, protein: 3, baseGrams: 200, unit: '1 porsiyon', isHealthy: true },
  { id: 'tr29', name: 'Yaprak Sarma', calories: 35, protein: 1, baseGrams: 30, unit: '1 adet', isHealthy: true },
  { id: 'tr30', name: 'Börek', calories: 280, protein: 7, baseGrams: 100, unit: '1 dilim', isHealthy: false },
  { id: 'tr31', name: 'Elma', calories: 52, protein: 0.3, baseGrams: 100, unit: '1 adet', isHealthy: true },
  { id: 'tr32', name: 'Muz', calories: 90, protein: 1, baseGrams: 120, unit: '1 adet', isHealthy: true },
  { id: 'tr33', name: 'Ceviz', calories: 195, protein: 4, baseGrams: 30, unit: '1 avuç', portionGrams: { avuc: 30, kase: 100, tabak: 200, kasik: 10 }, isHealthy: true },
  { id: 'tr34', name: 'Badem', calories: 170, protein: 6, baseGrams: 30, unit: '1 avuç', portionGrams: { avuc: 30, kase: 120 }, isHealthy: true },
  { id: 'tr35', name: 'Leblebi', calories: 100, protein: 5, baseGrams: 30, unit: '1 avuç', portionGrams: { avuc: 30, kase: 100 }, isHealthy: true },
  { id: 'tr36', name: 'Baklava', calories: 165, protein: 2, baseGrams: 40, unit: '1 dilim', isHealthy: false },
  { id: 'tr37', name: 'Sütlaç', calories: 260, protein: 6, baseGrams: 250, unit: '1 kase', portionGrams: { kase: 250 }, isHealthy: false },
  { id: 'tr38', name: 'Künefe', calories: 450, protein: 8, baseGrams: 150, unit: '1 porsiyon', isHealthy: false },
  { id: 'tr39', name: 'Revani', calories: 350, protein: 5, baseGrams: 100, unit: '1 dilim', isHealthy: false },
  { id: 'tr40', name: 'Ayran', calories: 76, protein: 4, baseGrams: 200, unit: '1 bardak', portionGrams: { bardak: 200, kase: 300 }, isHealthy: true },
  { id: 'tr41', name: 'Çay', calories: 1, protein: 0, baseGrams: 100, unit: '1 bardak', isHealthy: true },
  { id: 'tr42', name: 'Türk Kahvesi', calories: 7, protein: 0.5, baseGrams: 80, unit: '1 fincan', isHealthy: true },
  { id: 'tr43', name: 'Kola', calories: 140, protein: 0, baseGrams: 330, unit: '1 kutu', portionGrams: { bardak: 250 }, isHealthy: false },
  { id: 'tr44', name: 'Ekmek', calories: 90, protein: 3, baseGrams: 30, unit: '1 dilim', isHealthy: false },
  { id: 'tr45', name: 'Makarna', calories: 350, protein: 11, baseGrams: 250, unit: '1 tabak', portionGrams: { tabak: 250, kase: 200, kasik: 20 }, isHealthy: false }
];

const getHealthySuggestions = (remaining) => {
  if (remaining <= 0) return [];
  let suggestions = LOCAL_FOODS.filter(f => f.isHealthy && f.calories <= remaining + 50);
  suggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 5);
  return suggestions;
};

export default function App() {
  const [profiles, setProfiles] = useState([]); 
  const [currentProfile, setCurrentProfile] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [isManageMode, setIsManageMode] = useState(false);

  // State'ler
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]); 
  const [selectedFood, setSelectedFood] = useState(null);
  const [inputAmount, setInputAmount] = useState('1'); 
  const [inputType, setInputType] = useState('portion'); 

  // Profil Form
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('lose'); 
  const [activity, setActivity] = useState('sedentary'); 

  useEffect(() => { loadProfiles(); }, []);

  const loadProfiles = async () => {
    try {
      const stored = await AsyncStorage.getItem('vitalis_profiles');
      if (stored) setProfiles(JSON.parse(stored));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const saveToStorage = async (newProfiles) => {
    try {
      await AsyncStorage.setItem('vitalis_profiles', JSON.stringify(newProfiles));
      setProfiles(newProfiles);
    } catch (e) { console.error(e); }
  };

  // --- GEÇİŞ FONKSİYONU ---
  const changeProfile = (profile) => {
    // Sadece opaklık değişsin, düzen (layout) değişmesin
    LayoutAnimation.configureNext(ScreenTransition);
    setCurrentProfile(profile);
  };

  const updateWater = (change) => {
    if (!currentProfile) return;
    const currentWater = currentProfile.water || 0;
    let newWater = currentWater + change;
    if (newWater < 0) newWater = 0;
    const updatedProfile = { ...currentProfile, water: newWater };
    const updatedAllProfiles = profiles.map(p => p.id === currentProfile.id ? updatedProfile : p);
    saveToStorage(updatedAllProfiles);
    setCurrentProfile(updatedProfile);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { Alert.alert("Uyarı", "Lütfen bir şey yazın."); return; }
    setIsSearching(true); setSearchResults([]); Keyboard.dismiss(); 
    let combinedResults = [];
    const queryLower = searchQuery.toLocaleLowerCase('tr-TR');
    const localMatches = LOCAL_FOODS.filter(food => food.name.toLocaleLowerCase('tr-TR').includes(queryLower)).map(item => ({...item, source: 'Lokal'}));
    combinedResults = [...localMatches];
    const apiPromise = fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchQuery}&search_simple=1&action=process&json=1&page_size=10&cc=tr`).then(res => res.json());
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
    try {
      const data = await Promise.race([apiPromise, timeoutPromise]);
      if (data.products) {
        const apiResults = data.products.map(item => ({
          id: item.code || Math.random().toString(),
          name: item.product_name || "Bilinmeyen Ürün",
          calories: item.nutriments ? Math.round(item.nutriments['energy-kcal_100g'] || 0) : 0,
          protein: item.nutriments ? Math.round(item.nutriments['proteins_100g'] || 0) : 0,
          baseGrams: 100, unit: '100g', source: 'Market' 
        })).filter(i => i.calories > 0);
        combinedResults = [...combinedResults, ...apiResults];
      }
    } catch (error) { console.log("API Hatası", error); } 
    setSearchResults(combinedResults); setIsSearching(false);
    if (combinedResults.length === 0) { Alert.alert("Bulunamadı", "Aradığınız ürün bulunamadı."); }
  };

  const openFoodDetail = (food) => {
    setSelectedFood(food); setInputAmount('1'); setInputType('portion'); 
    setSearchModalVisible(false);
    setTimeout(() => { setDetailModalVisible(true); }, 300);
  };

  const closeDetailAndReturn = () => {
    setDetailModalVisible(false);
    setTimeout(() => { setSearchModalVisible(true); }, 300);
  };

  const selectQuickPortion = (type) => {
    setInputType('gram'); 
    let amount = 100; 
    if (selectedFood && selectedFood.portionGrams && selectedFood.portionGrams[type]) {
      amount = selectedFood.portionGrams[type];
    } else {
      switch(type) {
        case 'kibrit': amount = 30; break; case 'kasik': amount = 15; break; case 'bardak': amount = 200; break; 
        case 'kase': amount = 250; break; case 'tabak': amount = 300; break; case 'avuc': amount = 40; break; default: amount = 100;
      }
    }
    setInputAmount(amount.toString());
  };

  const calculateFinalMacros = () => {
    if (!selectedFood) return { cal: 0, prot: 0 };
    const amount = parseFloat(inputAmount) || 0;
    const baseCal = selectedFood.calories;
    const baseProt = selectedFood.protein;
    const baseG = selectedFood.baseGrams || 100;
    let finalCal = 0, finalProt = 0;
    if (inputType === 'portion') { finalCal = baseCal * amount; finalProt = baseProt * amount; } 
    else { finalCal = (baseCal / baseG) * amount; finalProt = (baseProt / baseG) * amount; }
    return { cal: Math.round(finalCal), prot: Math.round(finalProt) };
  };

  const confirmAddFood = () => {
    if (!currentProfile || !selectedFood) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const macros = calculateFinalMacros();
    const newFood = {
      id: Date.now(), name: selectedFood.name, calories: macros.cal, protein: macros.prot,
      amountDisplay: inputType === 'portion' ? `${inputAmount} x (${selectedFood.unit})` : `${inputAmount}g`,
      date: new Date().toLocaleDateString()
    };
    const updatedFoods = currentProfile.consumedFoods ? [...currentProfile.consumedFoods, newFood] : [newFood];
    const updatedTotalCal = (currentProfile.totalCaloriesToday || 0) + macros.cal;
    const updatedProfile = { ...currentProfile, consumedFoods: updatedFoods, totalCaloriesToday: updatedTotalCal };
    const updatedAllProfiles = profiles.map(p => p.id === currentProfile.id ? updatedProfile : p);
    saveToStorage(updatedAllProfiles); setCurrentProfile(updatedProfile);
    setDetailModalVisible(false); setSearchQuery(''); setSearchResults([]);
  };

  const removeFoodFromProfile = (foodId, foodCal) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updatedFoods = currentProfile.consumedFoods.filter(f => f.id !== foodId);
    const updatedTotalCal = (currentProfile.totalCaloriesToday || 0) - foodCal;
    const updatedProfile = { ...currentProfile, consumedFoods: updatedFoods, totalCaloriesToday: updatedTotalCal };
    const updatedAllProfiles = profiles.map(p => p.id === currentProfile.id ? updatedProfile : p);
    saveToStorage(updatedAllProfiles); setCurrentProfile(updatedProfile);
  };

  const handleSaveProfile = () => {
    if (!name || !age || !height || !weight) { Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun."); return; }
    let bmrCalc = (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age));
    bmrCalc = gender === 'male' ? bmrCalc + 5 : bmrCalc - 161;
    let activityMultiplier = 1.2; 
    if (activity === 'sedentary') activityMultiplier = 1.2; else if (activity === 'light') activityMultiplier = 1.375;
    else if (activity === 'moderate') activityMultiplier = 1.55; else if (activity === 'active') activityMultiplier = 1.725;
    const tdee = bmrCalc * activityMultiplier;
    let targetCalories = Math.round(tdee);
    if (goal === 'lose') targetCalories -= 400; else if (goal === 'gain') targetCalories += 400; 
    const newProfile = {
      id: editingId || Date.now(), name, color: editingId ? profiles.find(p=>p.id===editingId).color : AVATAR_COLORS[profiles.length % AVATAR_COLORS.length],
      stats: { age, height, weight, gender, goal, activity, bmr: targetCalories }, consumedFoods: [], totalCaloriesToday: 0, water: 0
    };
    let updatedList = editingId ? profiles.map(p => p.id === editingId ? { ...p, ...newProfile, consumedFoods: p.consumedFoods, totalCaloriesToday: p.totalCaloriesToday, water: p.water } : p) : [...profiles, newProfile];
    saveToStorage(updatedList); closeModal();
  };

  const handleDelete = (id) => Alert.alert("Sil", "Emin misin?", [{ text: "Vazgeç" }, { text: "Sil", style: 'destructive', onPress: () => saveToStorage(profiles.filter(p => p.id !== id)) }]);
  const openModal = (profile = null) => { 
    if (profile) { setEditingId(profile.id); setName(profile.name); setAge(profile.stats.age); setHeight(profile.stats.height); setWeight(profile.stats.weight); setGender(profile.stats.gender); setGoal(profile.stats.goal || 'lose'); setActivity(profile.stats.activity || 'sedentary'); } 
    else { setEditingId(null); setName(''); setAge(''); setHeight(''); setWeight(''); setGender('male'); setGoal('lose'); setActivity('sedentary'); } setModalVisible(true); 
  };
  const closeModal = () => { setModalVisible(false); setIsManageMode(false); };

  const remainingCalories = currentProfile ? (currentProfile.stats.bmr - (currentProfile.totalCaloriesToday || 0)) : 0;
  
  const suggestions = useMemo(() => {
    if (!currentProfile) return [];
    return getHealthySuggestions(remainingCalories);
  }, [remainingCalories, currentProfile?.id]); 

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.login.primary} /></View>;

  // --- UI: İÇ MENÜ (DASHBOARD) ---
  if (currentProfile) {
    return (
      // KEY EKLENDİ: Artık React bu ekranın tamamen farklı olduğunu biliyor.
      <SafeAreaView key="dashboard-screen" style={[styles.container, { backgroundColor: COLORS.dashboard.bg }]}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.dashHeader}>
          <Text style={[styles.dashWelcome, {color: COLORS.dashboard.headerText}]}>Merhaba, {currentProfile.name}!</Text>
          <TouchableOpacity onPress={() => changeProfile(null)}>
            <AntDesign name="poweroff" size={24} color={COLORS.dashboard.subText} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom: 20}}>
            <View style={[styles.statCard, { backgroundColor: COLORS.dashboard.card1Bg }]}>
              <Text style={[styles.statTitle, {color: COLORS.dashboard.card1Title}]}>KALAN LİMİT</Text>
              <Text style={[styles.statValue, {color: COLORS.dashboard.card1Value}]}>{remainingCalories} kcal</Text>
              <Text style={[styles.statSub, {color: COLORS.dashboard.card1Title}]}>Hedef: {currentProfile.stats.bmr} • Alınan: {currentProfile.totalCaloriesToday || 0}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: COLORS.dashboard.card2Bg, marginTop: 0, paddingHorizontal: 15 }]}>
              <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%'}}>
                <View style={{flex: 1}}>
                    <Text style={[styles.statTitle, {fontSize: 18, color: COLORS.dashboard.card2Title, marginBottom: 0, textAlign:'left'}]}>Su Tüketimi</Text>
                </View>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <TouchableOpacity onPress={() => updateWater(-1)} style={styles.waterBtn}><Text style={styles.waterBtnText}>-</Text></TouchableOpacity>
                    <View style={{alignItems:'center', marginHorizontal: 15, width: 80}}>
                        <Text style={styles.waterCount}>{currentProfile.water || 0} Bardak</Text>
                        <Text style={styles.literText}>{((currentProfile.water || 0) * 0.2).toFixed(1)} Litre</Text>
                    </View>
                    <TouchableOpacity onPress={() => updateWater(1)} style={styles.waterBtn}><Text style={styles.waterBtnText}>+</Text></TouchableOpacity>
                </View>
              </View>
            </View>

            {remainingCalories > 50 && suggestions.length > 0 && (
                <View style={{marginTop: 15}}>
                    <Text style={[styles.sectionTitleSmall, {color: COLORS.dashboard.sectionTitle}]}>💡 Kalorine Uygun Sağlıklı Öneriler</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingLeft: 20, marginTop: 10}}>
                        {suggestions.map((item, index) => (
                            <TouchableOpacity key={index} style={[styles.suggestionCard, {backgroundColor: COLORS.dashboard.suggestionBg, borderColor: COLORS.dashboard.suggestionBorder}]} onPress={() => openFoodDetail(item)}>
                                <Text style={styles.suggestionName}>{item.name}</Text>
                                <Text style={[styles.suggestionCal, {color: COLORS.dashboard.suggestionText}]}>{item.calories} kcal</Text>
                                <Text style={styles.suggestionAdd}>+ Ekle</Text>
                            </TouchableOpacity>
                        ))}
                        <View style={{width: 30}}></View> 
                    </ScrollView>
                </View>
            )}

            <View style={styles.listHeaderArea}>
              <Text style={[styles.sectionTitle, {color: COLORS.dashboard.sectionTitle}]}>Bugün Yenilenler</Text>
              <TouchableOpacity style={[styles.addFoodMiniBtn, {backgroundColor: COLORS.dashboard.addButtonBg}]} onPress={() => setSearchModalVisible(true)}>
                <Text style={[styles.addFoodBtnText, {color: COLORS.dashboard.addButtonText}]}>+ Besin Ekle</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.contentArea}>
                {currentProfile.consumedFoods && currentProfile.consumedFoods.length > 0 ? (
                    currentProfile.consumedFoods.slice().reverse().map((item) => (
                        <View key={item.id} style={styles.foodItem}>
                            <View>
                            <Text style={styles.foodName}>{item.name}</Text>
                            <Text style={styles.foodDetail}>{item.amountDisplay} • {item.calories} kcal</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeFoodFromProfile(item.id, item.calories)}><Text style={styles.deleteIcon}>✕</Text></TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text style={styles.placeholderText}>Henüz bir şey eklemedin.</Text>
                )}
            </View>
        </ScrollView>
        
        <Modal visible={searchModalVisible} animationType="slide">
          <SafeAreaView style={styles.searchModalContainer}>
            <View style={styles.searchHeader}>
              <TouchableOpacity onPress={() => setSearchModalVisible(false)}><Text style={styles.closeText}>Kapat</Text></TouchableOpacity>
              <Text style={[styles.searchTitle, {color: COLORS.dashboard.addButtonBg}]}>Besin Ara</Text>
              <View style={{width:40}}></View>
            </View>
            <View style={styles.searchBoxArea}>
              <TextInput style={styles.searchInput} placeholder="Örn: Kebap, Eti Cin, Elma..." value={searchQuery} onChangeText={setSearchQuery} />
              <TouchableOpacity style={[styles.searchBtn, {backgroundColor: COLORS.dashboard.addButtonBg}]} onPress={handleSearch}>
                {isSearching ? <ActivityIndicator color="#fff"/> : <Text style={styles.searchBtnText}>ARA</Text>}
              </TouchableOpacity>
            </View>
            <FlatList 
              data={searchResults}
              keyExtractor={(item, index) => index.toString()}
              keyboardShouldPersistTaps="always" 
              style={styles.resultArea}
              renderItem={({item}) => (
                <View style={styles.resultItem}>
                  <View style={{flex:1}}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultInfo}>{item.calories} kcal (Standart)</Text>
                    <View style={[styles.sourceBadge, { backgroundColor: item.source === 'Lokal' ? COLORS.localBadge : COLORS.marketBadge }]}><Text style={styles.sourceText}>{item.source}</Text></View>
                  </View>
                  <TouchableOpacity style={styles.addResultBtn} onPress={() => openFoodDetail(item)}><Text style={styles.addResultText}>SEÇ</Text></TouchableOpacity>
                </View>
              )}
            />
          </SafeAreaView>
        </Modal>

        <Modal visible={detailModalVisible} animationType="fade" transparent={true}>
           <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
             <View style={styles.modalOverlay}>
               <View style={styles.detailCard}>
                 {selectedFood && (
                   <>
                     <Text style={styles.detailTitle}>{selectedFood.name}</Text>
                     <View style={styles.macroRow}>
                        <View style={styles.macroBox}><Text style={styles.macroVal}>{calculateFinalMacros().cal}</Text><Text style={styles.macroLabel}>Kalori</Text></View>
                        <View style={styles.macroBox}><Text style={styles.macroVal}>{calculateFinalMacros().prot}g</Text><Text style={styles.macroLabel}>Protein</Text></View>
                     </View>
                     <View style={styles.inputRow}>
                        <TextInput style={styles.amountInput} value={inputAmount} onChangeText={setInputAmount} keyboardType="numeric"/>
                        <View style={styles.toggleGroup}>
                          <TouchableOpacity onPress={() => setInputType('portion')} style={[styles.toggleBtn, inputType === 'portion' && styles.toggleActive]}><Text style={[styles.toggleText, inputType === 'portion' && {color:'#fff'}]}>Porsiyon</Text></TouchableOpacity>
                          <TouchableOpacity onPress={() => setInputType('gram')} style={[styles.toggleBtn, inputType === 'gram' && styles.toggleActive]}><Text style={[styles.toggleText, inputType === 'gram' && {color:'#fff'}]}>Gram</Text></TouchableOpacity>
                        </View>
                     </View>
                     <Text style={styles.helperTitle}>Hızlı Ölçü Seç:</Text>
                     <View style={styles.helperGrid}>
                        <TouchableOpacity style={styles.helperBtn} onPress={() => selectQuickPortion('kibrit')}><Text style={styles.helperText}>🧀 Kibrit Kutusu</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.helperBtn} onPress={() => selectQuickPortion('kasik')}><Text style={styles.helperText}>🥄 Yemek Kaşığı</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.helperBtn} onPress={() => selectQuickPortion('bardak')}><Text style={styles.helperText}>🥛 Su Bardağı</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.helperBtn} onPress={() => selectQuickPortion('kase')}><Text style={styles.helperText}>🥣 Kase</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.helperBtn} onPress={() => selectQuickPortion('tabak')}><Text style={styles.helperText}>🍽️ Tabak</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.helperBtn} onPress={() => selectQuickPortion('avuc')}><Text style={styles.helperText}>✊ Avuç</Text></TouchableOpacity>
                     </View>
                     <TouchableOpacity style={styles.confirmBtn} onPress={confirmAddFood}><Text style={styles.confirmText}>LİSTEYE EKLE</Text></TouchableOpacity>
                     <TouchableOpacity style={styles.cancelLink} onPress={closeDetailAndReturn}><Text style={styles.cancelText}>Vazgeç</Text></TouchableOpacity>
                   </>
                 )}
               </View>
             </View>
           </TouchableWithoutFeedback>
        </Modal>

      </SafeAreaView>
    );
  }

  // --- UI: GİRİŞ EKRANI ---
  return (
    // KEY EKLENDİ: Burası da ayrı bir "ekran" olarak işaretlendi.
    <SafeAreaView key="login-screen" style={[styles.container, { backgroundColor: COLORS.login.bg }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.logoArea}>
        <Text style={[styles.appLogo, {color: COLORS.login.logoText}]}>VIGOR</Text>
        <Text style={[styles.tagline, {color: COLORS.login.text}]}>Kalori Takip & Sağlık</Text>
      </View>
      <Text style={[styles.whoText, {color: COLORS.login.logoText}]}>Kim Tüketiyor?</Text>
      <View style={styles.gridContainer}>
        {profiles.map(profile => (
          <View key={profile.id} style={styles.profileWrapper}>
            <TouchableOpacity style={[styles.avatarBox, {backgroundColor: profile.color}, isManageMode && styles.avatarDimmed]} onPress={() => !isManageMode && changeProfile(profile)} activeOpacity={0.8}>
              <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
              {isManageMode && (<View style={styles.manageOverlay}><TouchableOpacity onPress={() => openModal(profile)} style={styles.iconBtn}><Text style={styles.iconText}>✎</Text></TouchableOpacity><TouchableOpacity onPress={() => handleDelete(profile.id)} style={[styles.iconBtn, {backgroundColor: COLORS.danger}]}><Text style={styles.iconText}>X</Text></TouchableOpacity></View>)}
            </TouchableOpacity>
            <Text style={[styles.profileName, {color: COLORS.login.subText}]}>{profile.name}</Text>
          </View>
        ))}
        {profiles.length < 4 && (<View style={styles.profileWrapper}><TouchableOpacity style={styles.addBox} onPress={() => openModal(null)}><Text style={styles.addSign}>+</Text></TouchableOpacity><Text style={[styles.profileName, {color: COLORS.login.subText}]}>Profil Ekle</Text></View>)}
      </View>
      {profiles.length > 0 && (<TouchableOpacity style={[styles.manageButton, {borderColor: COLORS.login.subText}]} onPress={() => setIsManageMode(!isManageMode)}><Text style={[styles.manageButtonText, {color: COLORS.login.subText}]}>{isManageMode ? "BİTTİ" : "PROFİLLERİ YÖNET"}</Text></TouchableOpacity>)}
      
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <ScrollView contentContainerStyle={{paddingBottom: 20}}>
                        <Text style={styles.modalTitle}>{editingId ? "Profili Düzenle" : "Yeni Profil"}</Text>
                        <TextInput style={styles.input} placeholder="İsim" value={name} onChangeText={setName} />
                        <View style={styles.row}>
                            <TouchableOpacity onPress={() => setGender('male')} style={[styles.genderBtn, gender==='male' && styles.genderActive]}><Text style={[styles.genderText, gender==='male' && {color:'#fff'}]}>Erkek</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setGender('female')} style={[styles.genderBtn, gender==='female' && styles.genderActive]}><Text style={[styles.genderText, gender==='female' && {color:'#fff'}]}>Kadın</Text></TouchableOpacity>
                        </View>
                        <View style={styles.row}>
                            <TextInput style={[styles.input, {flex:1, marginRight:5}]} placeholder="Yaş" keyboardType="numeric" value={age} onChangeText={setAge} />
                            <TextInput style={[styles.input, {flex:1, marginHorizontal:5}]} placeholder="Boy" keyboardType="numeric" value={height} onChangeText={setHeight} />
                            <TextInput style={[styles.input, {flex:1, marginLeft:5}]} placeholder="Kilo" keyboardType="numeric" value={weight} onChangeText={setWeight} />
                        </View>
                        <Text style={styles.sectionLabel}>Günlük Hareketin:</Text>
                        <View style={styles.row}>
                            <TouchableOpacity onPress={() => setActivity('sedentary')} style={[styles.goalBtn, activity==='sedentary' && {backgroundColor: COLORS.login.primary}]}><Text style={[styles.goalText, activity==='sedentary' && {color:'#fff'}]}>Hareketsiz</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setActivity('light')} style={[styles.goalBtn, activity==='light' && {backgroundColor: COLORS.marketBadge}]}><Text style={[styles.goalText, activity==='light' && {color:'#fff'}]}>Az Hareketli</Text></TouchableOpacity>
                        </View>
                        <View style={[styles.row, {marginTop: 5}]}>
                            <TouchableOpacity onPress={() => setActivity('moderate')} style={[styles.goalBtn, activity==='moderate' && {backgroundColor: COLORS.success}]}><Text style={[styles.goalText, activity==='moderate' && {color:'#fff'}]}>Hareketli</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setActivity('active')} style={[styles.goalBtn, activity==='active' && {backgroundColor: '#e67e22'}]}><Text style={[styles.goalText, activity==='active' && {color:'#fff'}]}>Sporcu</Text></TouchableOpacity>
                        </View>
                        <Text style={styles.sectionLabel}>Hedefin Ne?</Text>
                        <View style={styles.row}>
                            <TouchableOpacity onPress={() => setGoal('lose')} style={[styles.goalBtn, goal==='lose' && {backgroundColor:'#e74c3c'}]}><Text style={[styles.goalText, goal==='lose' && {color:'#fff'}]}>Zayıfla</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setGoal('maintain')} style={[styles.goalBtn, goal==='maintain' && {backgroundColor:'#f1c40f'}]}><Text style={[styles.goalText, goal==='maintain' && {color:'#fff'}]}>Koru</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setGoal('gain')} style={[styles.goalBtn, goal==='gain' && {backgroundColor:'#27ae60'}]}><Text style={[styles.goalText, goal==='gain' && {color:'#fff'}]}>Kilo Al</Text></TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.saveBtn, {backgroundColor: COLORS.login.primary}]} onPress={handleSaveProfile}><Text style={styles.saveBtnText}>KAYDET</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}><Text style={styles.cancelBtnText}>İPTAL</Text></TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, logoArea: { marginTop: 60, marginBottom: 40, alignItems: 'center' }, appLogo: { fontSize: 40, fontWeight: '900', letterSpacing: 4 }, whoText: { fontSize: 24, fontWeight: '300', marginBottom: 30 }, tagline: { fontSize: 14, marginTop: 0, fontWeight: '600' }, gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '80%' }, profileWrapper: { alignItems: 'center', margin: 15 }, avatarBox: { width: 100, height: 100, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }, avatarDimmed: { opacity: 0.6 }, avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' }, profileName: { marginTop: 10, fontSize: 16 }, addBox: { width: 100, height: 100, borderRadius: 100, borderWidth: 2, borderColor: '#808080', justifyContent: 'center', alignItems: 'center' }, addSign: { fontSize: 50, color: '#808080', fontWeight: '100' }, manageButton: { marginTop: 50, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 25 }, manageButtonText: { fontSize: 16, letterSpacing: 2, fontWeight: 'bold' }, manageOverlay: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10 }, iconBtn: { margin: 5, backgroundColor: '#1909adde', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }, iconText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  // Dashboard Styles
  dashHeader: { width: '100%', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, 
  dashWelcome: { fontSize: 22, fontWeight: 'bold' }, switchProfileText: { fontWeight: 'bold' }, 
  
  statCard: { margin: 20, padding: 30, borderRadius: 20, alignItems: 'center', elevation: 10 }, statTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 }, statValue: { fontSize: 50, fontWeight: 'bold' }, statSub: { opacity: 0.9 }, listHeaderArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 15 }, sectionTitle: { fontSize: 18, fontWeight: 'bold' }, sectionTitleSmall: { fontSize: 16, fontWeight: 'bold', marginLeft: 20 }, 
  addFoodMiniBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 }, 
  addFoodBtnText: { fontWeight: 'bold', fontSize: 12 }, 
  contentArea: { padding: 20 }, placeholderText: { color: '#7f8c8d', textAlign: 'center', marginTop: 50 }, foodItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 }, foodName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', textTransform: 'capitalize' }, foodDetail: { color: '#7f8c8d', fontSize: 14 }, deleteIcon: { color: COLORS.danger, fontSize: 18, fontWeight: 'bold', padding: 5 },
  
  // Modal & Components
  searchModalContainer: { flex: 1, backgroundColor: '#F8F9FA' }, 
  searchHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' }, 
  searchTitle: { fontSize: 18, fontWeight: 'bold' }, 
  closeText: { color: COLORS.danger, fontSize: 16 }, 
  searchBoxArea: { padding: 20, flexDirection: 'row' }, 
  searchInput: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 10, marginRight: 10, borderWidth: 1, borderColor: '#ddd' }, 
  searchBtn: { justifyContent: 'center', paddingHorizontal: 20, borderRadius: 10 }, 
  searchBtnText: { color: '#fff', fontWeight: 'bold' }, 
  resultArea: { paddingHorizontal: 20 }, 
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 5, borderLeftColor: '#1909adde' }, 
  resultName: { fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize' }, 
  resultInfo: { color: '#7f8c8d', fontSize: 12 }, 
  addResultBtn: { backgroundColor: COLORS.success, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 }, 
  addResultText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }, 
  sourceBadge: { marginTop: 5, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 5, alignSelf: 'flex-start' }, 
  sourceText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }, modalCard: { width: '85%', maxHeight:'80%', backgroundColor: '#fff', padding: 25, borderRadius: 10 }, modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' }, input: { backgroundColor: '#f1f2f6', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 }, row: { flexDirection: 'row', marginBottom: 15 }, genderBtn: { flex: 1, padding: 15, backgroundColor: '#f1f2f6', alignItems: 'center', borderRadius: 8, marginHorizontal: 5 }, genderActive: { backgroundColor: '#2d3436' }, genderText: { color: '#333', fontWeight: '600' }, saveBtn: { padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10, marginTop: 10 }, saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }, cancelBtn: { padding: 10, alignItems: 'center' }, cancelBtnText: { color: '#636e72' }, sectionLabel: {fontWeight:'bold', color: COLORS.textSub, marginBottom: 5, marginTop: 5},
  
  waterBtn: { backgroundColor: 'rgba(255,255,255,0.3)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  waterBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  waterCount: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign:'center' },
  literText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign:'center' },

  goalBtn: { flex: 1, padding: 12, backgroundColor: '#f1f2f6', borderRadius: 8, marginHorizontal: 3, alignItems: 'center' },
  goalText: { fontWeight: 'bold', color: '#7f8c8d' },

  suggestionCard: { padding: 15, borderRadius: 12, marginRight: 10, width: 140, alignItems: 'center', elevation: 3, borderWidth: 1 },
  suggestionName: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 5, textAlign: 'center' },
  suggestionCal: { fontSize: 12, fontWeight: 'bold' },
  suggestionAdd: { marginTop: 8, color: COLORS.success, fontWeight: 'bold', fontSize: 12 },

  detailCard: { width: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center' },
  detailTitle: { fontSize: 22, fontWeight: 'bold', color: '#1909adde', marginBottom: 20, textAlign: 'center' },
  macroRow: { flexDirection: 'row', marginBottom: 20 },
  macroBox: { alignItems: 'center', marginHorizontal: 15 },
  macroVal: { fontSize: 24, fontWeight: 'bold', color: COLORS.success },
  macroLabel: { fontSize: 12, color: '#7f8c8d' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, width: '100%' },
  amountInput: { flex: 1, backgroundColor: '#f1f2f6', fontSize: 24, fontWeight: 'bold', textAlign: 'center', padding: 10, borderRadius: 10, marginRight: 10 },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#f1f2f6', borderRadius: 10, padding: 2 },
  toggleBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  toggleActive: { backgroundColor: '#1909adde' },
  toggleText: { fontWeight: 'bold', color: '#7f8c8d' },
  helperTitle: { alignSelf: 'flex-start', fontWeight: 'bold', color: '#7f8c8d', marginBottom: 10 },
  helperGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  helperBtn: { backgroundColor: '#ecf0f1', padding: 8, borderRadius: 8, margin: 4 },
  helperText: { fontSize: 12, fontWeight: '600', color: '#2c3e50' },
  confirmBtn: { backgroundColor: COLORS.success, padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 10 },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelLink: { padding: 10 }, cancelText: { color: '#7f8c8d' }
});