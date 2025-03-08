package com.yyqcsc.make_yyq_great_again.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.yyqcsc.make_yyq_great_again.model.WordReview;

@Repository
public interface WordReviewRepository extends JpaRepository<WordReview, Long> {
}

