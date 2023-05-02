import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { useChatContext, Message } from '../contexts/ChatContext';

const ChatPage = () => {
    const { colors } = useTheme();
    const { messages, addMessage } = useChatContext();

    const [text, setText] = useState('');

    const handleSendMessage = () => {
        const msg = text.trim();
        if (msg) {
            const isUser = true;
            addMessage(msg, isUser);
            setText('');
        }
    };

    useEffect(() => {
    }, [messages]);

    const renderItem = ({ item }: { item: Message }) => (
        <View
            style={[
                styles.messageContainer,
                item.isUser ? styles.userMessageContainer : styles.recipientMessageContainer,
            ]}
        >
            <Text
                style={[
                    styles.messageText,
                    { color: item.isUser ? 'white' : colors.primary },
                ]}
            >
                {item.text}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item ? item.id.toString() : '0'}
                style={styles.messageList}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Type your message here"
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                />
                <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                    <Text style={[styles.sendButtonText, { color: colors.primary }]}>Send</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messageList: {
        flexGrow: 1,
    },
    messageContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 15,
        margin: 10,
        maxWidth: '75%',
    },
    userMessageContainer: {
        alignSelf: 'flex-end',
        backgroundColor: '#007AFF',
    },
    recipientMessageContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#F1F0F0',
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    input: {
        flex: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontSize: 16,
    },
    sendButton: {
        marginLeft: 10,
    },
    sendButtonText: {
        fontSize: 16,
    },
});

export default ChatPage;
