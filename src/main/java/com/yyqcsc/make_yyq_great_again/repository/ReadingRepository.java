package com.yyqcsc.make_yyq_great_again.repository;

import com.yyqcsc.make_yyq_great_again.model.Reading;
import com.yyqcsc.make_yyq_great_again.model.Reading_;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.ArrayList;
import java.util.List;

public interface ReadingRepository extends JpaRepository<Reading, Long>, JpaSpecificationExecutor<Reading> {
    default List<Reading> findAllByTitleAndSmallTittle(String title, String smallTitle) {
        Specification<Reading> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.equal(root.get(Reading_.TITLE), title));

            // 精确查询条件
            if (smallTitle != null) {
                predicates.add(criteriaBuilder.equal(root.get(Reading_.SMALL_TITLE), smallTitle));
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        return findAll(spec);
    }
}
