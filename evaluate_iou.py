import numpy as np

def calculate_iou(pred_mask, gt_mask):
    intersection = np.logical_and(pred_mask, gt_mask)
    union = np.logical_or(pred_mask, gt_mask)
    iou_score = np.sum(intersection) / np.sum(union)
    return iou_score

if __name__ == '__main__':
    print('Evaluating Segmentation IoU...')
    # Mock masks for demonstration
    ground_truth = np.zeros((100, 100))
    ground_truth[20:80, 20:80] = 1
    
    prediction = np.zeros((100, 100))
    prediction[22:78, 22:78] = 1
    
    iou = calculate_iou(prediction, ground_truth)
    print(f'Mean IoU against ground truth: {iou * 100:.2f}%')
    print('Evaluation pipeline ready.')
