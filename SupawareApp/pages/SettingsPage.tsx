import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const settingsItems = [
    { title: 'Account', route: 'Account' },
    { title: 'Devices', route: 'Devices' },
];

const SettingsPage: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <ScrollView>
                {settingsItems.map((item, index) => (
                    <TouchableOpacity key={index} onPress={() => navigation.navigate(item.route)}>
                        <View style={styles.item}>
                            <Text style={styles.text}>
                                {item.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        marginTop: 40,
        paddingHorizontal: 20,
    },
    item: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3, // This property is required for Android to display shadows
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default SettingsPage;
