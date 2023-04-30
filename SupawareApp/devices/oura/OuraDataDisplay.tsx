import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OuraDataDisplay = ({ ouraData }) => {
    const { activity, readiness, sleep } = ouraData;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Oura Data</Text>
            <Text style={styles.subtitle}>Activity</Text>
            {activity.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                    <Text>Summary Date: {item.summary_date}</Text>
                    <Text>Steps: {item.steps}</Text>
                    <Text>Calories Active: {item.cal_active}</Text>
                    {/* Add more fields here */}
                </View>
            ))}
            <Text style={styles.subtitle}>Readiness</Text>
            {readiness.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                    <Text>Summary Date: {item.summary_date}</Text>
                    <Text>Score: {item.score}</Text>
                    {/* Add more fields here */}
                </View>
            ))}
            <Text style={styles.subtitle}>Sleep</Text>
            {sleep.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                    <Text>Summary Date: {item.summary_date}</Text>
                    <Text>Duration: {item.duration}</Text>
                    <Text>Efficiency: {item.efficiency}</Text>
                    {/* Add more fields here */}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    itemContainer: {
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        padding: 10,
        marginBottom: 5,
    },
});

export default OuraDataDisplay;
