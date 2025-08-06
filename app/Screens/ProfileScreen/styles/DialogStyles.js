import { StyleSheet } from 'react-native';

export const dialogStyles = StyleSheet.create({
  // Dialog Overlay Styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlayTouchable: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 400,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
    overflow: 'hidden',
  },

  // Dialog Header Styles
  dialogHeader: {
    alignItems: 'center',
    padding: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'DMSans-Bold',
    fontWeight: '600',
  },
  dialogSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
  },

  // Dialog Actions Styles
  dialogActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'DMSans-Bold',
  },
  confirmButton: {
    backgroundColor: '#EF4444',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
  },
});