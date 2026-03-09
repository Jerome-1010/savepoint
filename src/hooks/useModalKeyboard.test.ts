import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useModalKeyboard } from './useModalKeyboard';

describe('useModalKeyboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls onCancel when Escape is pressed', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderHook(() => useModalKeyboard({ onConfirm, onCancel }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Cmd+Enter is pressed', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderHook(() => useModalKeyboard({ onConfirm, onCancel }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Ctrl+Enter is pressed', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderHook(() => useModalKeyboard({ onConfirm, onCancel }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('does nothing when enabled is false', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderHook(() => useModalKeyboard({ onConfirm, onCancel, enabled: false }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true }));

    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const { unmount } = renderHook(() => useModalKeyboard({ onConfirm, onCancel }));

    unmount();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true }));

    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
