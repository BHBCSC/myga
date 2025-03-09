package com.yyqcsc.make_yyq_great_again.controller;

import com.yyqcsc.make_yyq_great_again.model.SavedAudioClip;
import com.yyqcsc.make_yyq_great_again.model.WordReview;
import com.yyqcsc.make_yyq_great_again.model.WordReview_;
import com.yyqcsc.make_yyq_great_again.repository.WordReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.criteria.Predicate;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/wordReviews")
public class WordReviewController {

    @Autowired
    private WordReviewRepository wordReviewRepository;

    @PostMapping

    public ResponseEntity<WordReview> addWordReview(@RequestBody WordReview wordReview) {
        return new ResponseEntity<>(wordReviewRepository.save(wordReview), HttpStatus.CREATED);
    }

    @GetMapping("")
    public List<WordReview> list(String business, String type, String word, String result, String fuzzyWord, String fuzzyTitle, Timestamp reviewBegin, Timestamp reviewEnd) {
        Specification<WordReview> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 精确查询条件
            if (business != null && !business.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get(WordReview_.business), business));
            }
            if (type != null && !type.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get(WordReview_.type), type));
            }
            if (word != null && !word.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get(WordReview_.word), word));
            }
            if (result != null && !result.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get(WordReview_.result), result));
            }

            // 模糊查询条件
            if (fuzzyWord != null && !fuzzyWord.isEmpty()) {
                predicates.add(criteriaBuilder.like(root.get(WordReview_.word), "%" + fuzzyWord + "%"));
            }
            if (fuzzyTitle != null && !fuzzyTitle.isEmpty()) {
                predicates.add(criteriaBuilder.like(root.get(WordReview_.title), "%" + fuzzyTitle + "%"));
            }

            // 时间范围查询条件
            if (reviewBegin != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(WordReview_.reviewTime), reviewBegin));
            }
            if (reviewEnd != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(WordReview_.reviewTime), reviewEnd));
            }

            // 按 reviewTime 倒序排序
            query.orderBy(criteriaBuilder.desc(root.get(WordReview_.reviewTime)));

            // 将所有条件组合成一个 AND 条件
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        // 执行查询
        return wordReviewRepository.findAll(spec);
    }
}
